import { logger } from './logger'

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

export function unexpectListener (): void {
  logger.debug('unexcept listener start')
  errorTypes.forEach((type) => {
    process.on(type, async (err) => {
      try {
        logger.error(`process on ${type}: ${err}`)
        process.exit(1)
      } catch (_) {
        logger.error(`process catch ${type}: ${err}`)
        process.exit(2)
      }
    })
  })

  signalTraps.forEach((type: any) => {
    process.once(type, async (err) => {
      try {
        logger.error(`process on signal event: ${type}: ${err}`)
      } finally {
        process.kill(process.pid, type)
      }
    })
  })
}
