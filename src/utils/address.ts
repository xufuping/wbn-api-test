import { encodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import { Keyring } from '@polkadot/keyring'
import { logger } from './logger'

const anyChainSs58Prefix = 42
function useAnyChainAddress (address: string, isShort = false): string {
  return convertToSS58(address, anyChainSs58Prefix, isShort)
}

function convertToSS58 (text: string, prefix: number, isShort = false): string {
  if (!text) return ''

  try {
    let address = encodeAddress(text, prefix)
    if (isShort) {
      const len = 8
      address = address.substring(0, len) +
        '...' +
        address.substring(address.length - len, len)
    }

    return address
  } catch (error) {
    return ''
  }
}

function compareAddress (addr1: string, addr2: string): boolean {
  return useAnyChainAddress(addr1) === useAnyChainAddress(addr2)
}

function account2hex (account: string) {
  try {
    const keyring = new Keyring()
    const accountHex = u8aToHex(keyring.decodeAddress(account))
    return accountHex
  } catch (e) {
    logger.error(e)
    return 'Invalid accountId, cannot convert to hex'
  }
}

function hex2account (accountHex: string) {
  try {
    const keyring = new Keyring()
    const account = keyring.encodeAddress(accountHex)
    return account
  } catch (e) {
    logger.warn(`Invalid hex address: ${accountHex}`)
    return 'Invalid hex address, cannot convert to accountId'
  }
}

export {
  anyChainSs58Prefix,
  useAnyChainAddress,
  convertToSS58,
  compareAddress,
  account2hex,
  hex2account
}
