import { cryptoWaitReady } from '@polkadot/util-crypto'
import { Trader } from './trader'
import { defaultStrategy } from './trader/strategies'
import { TradeMode } from './trader/types'
import getConfig, { Config } from './utils/config'
import { ParaConnection } from './utils/connection/parallel'
import { logger } from './utils/logger'

async function main () {
  await initialize(getConfig())

  const trader = new Trader({
    mode: TradeMode.FilterByList,
    strategy: defaultStrategy
  })
  await trader.trade()

  logger.info('Stopping trading bot')
}

async function initialize (configs: Config) {
  try {
    logger.info('Starting trading bot')
    await cryptoWaitReady()
    await ParaConnection.init(configs.parallel)
  } catch (error) {
    throw new Error(`Initialize connections failed, error: ${error}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    logger.error(e.message)
    process.exit(1)
  })

process.on('unhandledRejection', (err) => logger.error(err))
