import { getAppLogger } from '../utils/logger'
import { TradeMode, TradeOption, TxEntity } from './types'
import { paraAgent, paraApi } from '../utils/connection/parallel'
import { CurrencyId } from '@parallel-finance/types/interfaces'
import { SwapNode } from './strategies'
import { handleError } from '../utils/error'
import { sleep } from '../utils/common'
import BigNumber from 'bignumber.js'
import { balanceToUnitByDecimals, signAndSend } from './util'
import { TradeProvider } from './provider'
import { random } from 'lodash'
import { AGGREGATE_TRADER_AMOUNT, MIN_TRADER_AMOUNT, MAX_TRADER_AMOUNT } from '../utils/constants'

const logger = getAppLogger('trader')

export class Trader {
    mode: TradeMode = TradeMode.FilterByList
    provider: TradeProvider
    traderTime:number
    traderAmount:number

    constructor (option: TradeOption) {
      this.mode = option.mode
      this.provider = new TradeProvider(option.strategy)
      this.traderTime = 0// swap成功总次数
      this.traderAmount = 0 // swap成功总金额
    }

    public describe () {
      logger.info(`trading strategy: ***${this.provider.strategy.name}***`)
    }

    public async trade () {
      await this.provider.init()
      this.describe()

      let epoch: number = 0
      while (this.traderAmount < AGGREGATE_TRADER_AMOUNT) {
        try {
          logger.info(`[epoch ${epoch++}]`)

          const swapPair = await this.provider.yield()
          if (!swapPair) {
            logger.warn('Not found available token pair to do swap')
            await sleep(this.provider.state.setting.listeningInterval)
            continue
          }

          // Doing swap in current block height
          await this.doSwap(swapPair as TxEntity)
        } catch (e) { logger.error(`trading error: ${e}`) }
      }
    }

    async doSwap (swapNode: SwapNode): Promise<void> {
      const swapPair = swapNode as TxEntity
      const { state: { pools, setting } } = this.provider
      const {
        pair: {
          base: { name: fromName, assetId: fromAssetId },
          quote: { name: toName, assetId: toAssetId }
        }
      } = swapPair
      const randomAmount = random(MIN_TRADER_AMOUNT, MAX_TRADER_AMOUNT)
      // TODO USD
      const amountIn = new BigNumber(randomAmount)

      const { depth } = pools[fromAssetId]
        ? pools[fromAssetId][toAssetId] ? pools[fromAssetId][toAssetId] : []
        : []
      const [fromSupply, toSupply] = depth || [0, 0]

      // TODO: improve this, not clear
      const transactionFee = fromAssetId === this.provider.state.nativeToken ? 0.03 : 0
      const amountInMinusFees = amountIn.minus(transactionFee || 0)

      const expectedOut = amountInMinusFees
        .multipliedBy(new BigNumber(toSupply))
        .div((new BigNumber(fromSupply).plus(new BigNumber(amountIn))))

      // TODO: I think slippage should be dynamic.
      const minReceived = expectedOut.multipliedBy(new BigNumber(1 - setting.tolerableSlippage / 100))

      logger.warn(`route: ${amountIn} ${fromName} => ${minReceived} ${toName}`)
      // TODO: do not swap if pool is not exised
      await this.swap(swapPair, amountIn, minReceived, randomAmount)
    }

    async swap (txEntity: TxEntity, amountIn: BigNumber, amountOut: BigNumber, randomAmount:number) {
      const params: any[] = [
        [
          txEntity.pair.base.assetId as unknown as CurrencyId,
          txEntity.pair.quote.assetId as unknown as CurrencyId
        ],
        balanceToUnitByDecimals(amountIn.toString(), txEntity.pair.base.decimal!).toString(),
        balanceToUnitByDecimals(amountOut.toString(), txEntity.pair.quote.decimal!).toString()
      ]
      logger.debug(`params: ${params}`)
      await signAndSend(paraApi, paraAgent, paraApi.tx.ammRoute.swapExactTokensForTokens(...params))
        .then(() => {
          // TODO success
          this.traderTime++
          this.traderAmount += randomAmount
          console.log('success', this.traderTime, this.traderAmount)
        })
        .catch(handleError)
        .finally(() => {
          logger.debug(`swapped ${txEntity.pair.base.name}, ${txEntity.pair.quote.name}`)
        })
    }
}
