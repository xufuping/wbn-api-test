import { AssetsAccount, Setting, State, SystemAccount, TradeMode, TxEntity } from './types'
import * as customConfig from '../../config/config.json'
import { getAppLogger } from '../utils/logger'
import { paraAgent, paraApi } from '../utils/connection/parallel'
import { u32 } from '@polkadot/types'
import BigNumber from 'bignumber.js'
import { BlindStrategy, Strategy } from './strategies'
import { fetchTokenPoolsWithTokens } from './util'
import { MIN_TRADER_BALANCE } from '../utils/constants'

const logger = getAppLogger('provider')

export class TradeProvider {
    mode: TradeMode = TradeMode.FilterByList
    state!: State
    strategy: Strategy = BlindStrategy

    constructor (strategy: Strategy) { this.strategy = strategy }

    public async init () {
      const [setting, txEntities] = this.initializeConfigs()
      const [pools, tokens] = await fetchTokenPoolsWithTokens(paraApi)
      const nativeToken = (paraApi.consts.currencyAdapter.getNativeCurrencyId as u32).toNumber()
      this.state = { nativeToken, setting, txEntities, pools, tokens } as State

      logger.info(`Initial provider state is ${JSON.stringify(this.state)}`)
    }

    private async forward () {
      await this.updateBalances()
      await this.updatePoolAndTokens()
    }

    public async yield () {
      await this.forward()

      const height = (await paraApi.query.system.number()) as unknown as number
      const validEntiies = this.state.txEntities
        .filter(entity => entity.max! > 0 && entity.min! > 0)

      return this.strategy.select(
        validEntiies,
        height,
        this.state.setting.swapIntervalBlocks
      )
    }

    private initializeConfigs (): [Setting, TxEntity[]] {
      const { supportedTokenPairs, settings } = customConfig
      const pairList = () => {
        switch (this.mode) {
          case TradeMode.FilterByList: {
            supportedTokenPairs.forEach((pair) => {
              logger.info(`supported pair: ${pair.pair.base.name} / ${pair.pair.quote.name}`)
            })
            return supportedTokenPairs
          }
          case TradeMode.Any: {
            logger.error('unimplemented')
            return []
          }
        }
      }

      return [settings, pairList()]
    }

    private async updatePoolAndTokens (): Promise<void> {
      const [pools, tokens] = await fetchTokenPoolsWithTokens(paraApi)
      this.state.pools = pools
      this.state.tokens = tokens
      // logger.warn(`pool is ${JSON.stringify(pools)}`)
      // logger.warn(`tokens is ${JSON.stringify(tokens)}`)
    }

    private async updateBalances () {
      for (const { pair } of this.state.txEntities) {
        const balance = await this.getBalance(pair.base.assetId)
        // const price = await this.getPrice(pair.base.assetId)

        logger.warn(`${pair.base.assetId} ${pair.base.name} balance is ${balance}`)
        const index = this.state.txEntities.findIndex(
          (item) => item.pair.base.assetId === pair.base.assetId &&
                item.pair.quote.assetId === pair.quote.assetId
        )

        const baseMin = new BigNumber(pair.base.min!)
        const baseMax = new BigNumber(pair.base.max!)
        const baseBalance = new BigNumber(balance)

        const minTraderBalance = new BigNumber(MIN_TRADER_BALANCE).multipliedBy(new BigNumber(10).pow(pair.base.decimal))
        const isAddTxEntities = baseBalance.comparedTo(minTraderBalance) >= 0

        if (pair.base.min && pair.base.max && isAddTxEntities) {
          const newTxEntity = {
            pair,
            min: baseMin,
            max: baseMax
          }

          this.state.txEntities[index] = Object.assign({}, this.state.txEntities[index], newTxEntity)
        }
      }
    }

    private async getBalance (assetId: number) {
      try {
        if (assetId === this.state.nativeToken) {
          const accountInfo = (await paraApi.query.system.account(paraAgent.address)) as unknown as SystemAccount
          return accountInfo ? accountInfo.data.free.toString().replace(/,/g, '') : '0'
        } else {
          const state = ((await paraApi.query.assets.account(assetId, paraAgent.address)) as any).unwrapOr(null)
          const accountInfo = state ? state.toHuman() as AssetsAccount : null
          return accountInfo ? accountInfo.balance.toString().replace(/,/g, '') : '0'
        }
      } catch (e) {
        logger.warn(`cannot get ${assetId} balance, error: ${e}`)
        return '0'
      }
    }

  // TODO Price
  // private async getPrice (assetId: number) {
  //   try {
  //     // const result = await paraApi.rpc.oracle.getValue('Aggregated', assetId)
  //     const result = await paraApi.rpc
  //     return result
  //   } catch (e) {
  //     logger.warn(`cannot get ${assetId} Price, error: ${e}`)
  //     return 0
  //   }
  // }
}
