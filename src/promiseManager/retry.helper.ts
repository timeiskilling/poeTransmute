import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor?: number;
  retryableStatuses?: number[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  logger?: Logger,
  contextName: string = 'Operation',
): Promise<T> {
  let attempt = 0;

  while (attempt <= options.maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;

      if (attempt > options.maxRetries) {
        logger?.error(
          `[${contextName}] Failed after ${options.maxRetries} retries.`,
        );
        throw error;
      }

      if (error) {
        const status = (error as AxiosError).response?.status;

        if (
          status &&
          options.retryableStatuses &&
          !options.retryableStatuses.includes(status)
        ) {
          logger?.error(
            `[${contextName}] Unretryable status code: ${status}. Aborting retries.`,
          );
          throw error;
        }
      }

      const factor = options.backoffFactor ?? 1;
      const delay = options.initialDelayMs * Math.pow(factor, attempt - 1);

      logger?.warn(
        `[${contextName}] Attempt ${attempt} failed. Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  throw new Error('Unreachable');
}
