import { logger } from './logger'

export const handleError = (err: { message: any }) => {
  const errMsg = err.message || err
  errMsg && logger.error(`handlerError: ${errMsg}`)
}
