import { Maybe } from './types'

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const notEmpty = <T>(value: Maybe<T>): value is T =>
  value !== null && value !== undefined

export async function asyncForEach (array: Array<any>, callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export async function asyncFilter (arr: Array<any>, predicate: any): Promise<any> {
  const results = await Promise.all(arr.map(predicate))
  return arr.filter((_v: any, index: number) => results[index])
};
