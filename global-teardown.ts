import logger from './helpers/logger';

async function globalTeardown(): Promise<void> {
  logger.info('[Global Teardown] Test suite complete');
}

export default globalTeardown;
