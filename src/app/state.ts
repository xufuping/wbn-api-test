import { ApiPromise } from '@polkadot/api'
import { normalizeId } from './util'
import { BigNumber } from 'bignumber.js'

export const fetchTokenPoolsWithTokens = async (api: ApiPromise): Promise<[any, any]> => {
  const pooList = await fetchAllTokenPools(api)
  const tokenList = await getAllAssetsWithMeta(api)
  return [formatPoolList(pooList, tokenList), tokenList]
}

export const formatPoolList = (poolList: any, tokenMap: any) =>
  poolList.reduce((acc: any, item: any) => {
    try {
      const [tokens, details] = item
      const [fromId, toId] = tokens
      const { baseAmount: rawFromDepth, quoteAmount: rawToDepth, lpTokenId: assetId } = details
      if (fromId !== undefined && toId !== undefined) {
        const fromTokenMeta = tokenMap[fromId]
        const toTokenMeta = tokenMap[toId]

        const depthFrom = unitToDecimalBalance(rawFromDepth, fromTokenMeta.decimals)
        const depthTo = unitToDecimalBalance(rawToDepth, toTokenMeta.decimals)
        acc[fromId] = {
          ...acc[fromId],
          [toId]: {
            tokenId: toId,
            assetId,
            depth: [depthFrom, depthTo],
            rawDepth: [rawFromDepth, rawToDepth]
          }
        }
        acc[toId] = {
          ...acc[toId],
          [fromId]: {
            tokenId: fromId,
            assetId,
            depth: [depthTo, depthFrom],
            rawDepth: [rawToDepth, rawFromDepth]
          }
        }
      }
    } catch (e) {
      console.error('failed to format pool: ', item)
    }
    return acc
  }, {})

const fetchAllTokenPools = async (api: ApiPromise) =>
  api.query.amm.pools
    .entries()
    .then(pairSet => pairSet.map(p => p.map(s => s.toHuman())))
    .then(humanSet =>
      humanSet.map(([tokens, details]) => [
        (tokens as any).map(normalizeId),
        Object.entries(details as any).reduce((acc: any, [key, value]) => {
          acc[key] = normalizeId(value)
          return acc
        }, {})
      ])
    )

const getAllAssetsWithMeta = async (api: ApiPromise) => {
  const tokens = await getFormattedList(api.query.assets.asset)
  const meta = await getFormattedList(api.query.assets.metadata)
  const tokensWithMeta: any = {
    0: {
      tokenId: 0,
      decimals: 12,
      name: 'Parallel Heiko',
      symbol: 'HKO',
      key: 'HKO'
    },
    1: {
      assetId: 1,
      decimals: 12,
      name: 'Parallel',
      symbol: 'PARA',
      key: 'PARA'
    }
  }
  meta.forEach(([id, data]: [any, any]) => {
    tokensWithMeta[id] = { ...data, tokenId: id, key: data.symbol }
  })
  tokens.forEach(([id, details]: [any, any]) => {
    tokensWithMeta[id].totalSupply = normalizeId(details.supply)
  })
  return tokensWithMeta
}

const formatPairSet = (pairSet: any) =>
  pairSet.map((p: any) => p.map((s: any) => s.toHuman())).map(([id, details]: [any, any]) => [normalizeId(id), details])

const getFormattedList = async (palletSet: any) => palletSet.entries().then(formatPairSet)

const unitToDecimalBalance = (amount: number | string, decimals: number) =>
  new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals)).toNumber()

export {
  fetchAllTokenPools,
  getAllAssetsWithMeta
}
