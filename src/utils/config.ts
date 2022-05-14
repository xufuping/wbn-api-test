import { getStringEnv } from './getEnv'

interface SubstrateConfig {
  agent: string,
  endpoint: string,
}
export interface ParallelConfig extends SubstrateConfig { }
export interface RelayConfig extends SubstrateConfig { }

export interface Config {
  parallel: SubstrateConfig
}
export interface ApiServiceConfig {
  configs: Config
}

const getConfig = (): Config => ({
  parallel: {
    agent: getStringEnv('PARALLEL_AGENT'),
    endpoint: getStringEnv('PARALLEL_ENDPOINT')
  }
})

export default getConfig
