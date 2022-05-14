import { u128, u32 } from '@polkadot/types'
import { Strategy } from './strategies'

export enum TradeMode {
    FilterByList,
    Any,
}

export type TokenInfo = {
    name: string
    assetId: number
    decimal: number
    balance?: string
    min?: string
    max?: string
}

export type TokenPair = {
    base: TokenInfo
    quote: TokenInfo
}

export type TxEntity = {
    pair: TokenPair
    min?: number
    max?: number
}

export interface TradeOption {
    mode: TradeMode
    strategy: Strategy
}

export interface SystemAccount {
    nonce: u32,
    consumers: u32,
    providers: u32,
    sufficients: u32,
    data: {
        free: u128,
        reserved: u128,
        miscFrozen: u128,
        feeFrozen: u128,
    },
}

export interface AssetsAccount {
    balance: u128,
    isFrozen: string,
    reason: string,
    extra: string
}

export type Setting = {
    swapIntervalBlocks: number,
    listeningInterval: number,
    tolerableSlippage: number,
}

export type State = {
    nativeToken: number
    setting: Setting
    // balances: Record<number, TokenInfo>
    pools: any
    tokens: any
    txEntities: TxEntity[]
}
