import { ApiOptions } from '@polkadot/api/types'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { logger } from '../../utils/logger'
import { KeyringPair } from '@polkadot/keyring/types'
import { ParallelConfig } from '../config'

export let paraApi: ApiPromise
export let paraAgent: KeyringPair
export let ParallelChainId: number

export namespace ParaConnection {
  export async function init (parallel: ParallelConfig) {
    paraApi = await ApiPromise.create({
      provider: new WsProvider(parallel.endpoint)
    } as ApiOptions)

    paraAgent = new Keyring({ type: 'sr25519' }).addFromMnemonic(parallel.agent)

    logger.info(`Connected endpoint: ${parallel.endpoint}, address: ${paraAgent.address}`)
  }
}
