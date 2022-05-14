import { logger } from './utils/logger';

async function main() {
  await initialize();

  logger.info('Stopping trading bot');
}

async function initialize() {
  try {
    logger.info('Starting trading bot');
  } catch (error) {
    throw new Error(`Initialize connections failed, error: ${error}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    logger.error(e.message);
    process.exit(1);
  });

process.on('unhandledRejection', err => logger.error(err));
