import { TxEntity } from '../types'

export type SwapNode = TxEntity | null

export type Strategy = {
  name: string
  select<T>(nodes: T[], ...args: any): T | null
}

export type StrategyMap = Record<string, Strategy>
