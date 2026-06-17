import { HttpStatus, HttpException, Logger } from '@nestjs/common';

export interface UnsafeExecution<T> {
  catchError(errorMessage: string, status?: HttpStatus): SafeExecution<T>;
}

export interface SafeExecution<T> {
  throwIfNullish(
    errorMessage?: string,
    status?: HttpStatus,
  ): Promise<NonNullable<T>>;
  throwIfEmptyArray(errorMessage?: string, status?: HttpStatus): Promise<T>;
  execute(): Promise<T>;
}

class PromiseExecutionWrapper<T>
  implements UnsafeExecution<T>, SafeExecution<T>
{
  private readonly logger = new Logger(PromiseExecutionWrapper.name);

  private constructor(private readonly promise: Promise<T>) {}

  static start<T>(promise: Promise<T>): UnsafeExecution<T> {
    return new PromiseExecutionWrapper(promise);
  }

  catchError(
    errorMessage: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): SafeExecution<T> {
    const wrappedPromise = this.promise.catch((err) => {
      throw new HttpException({ err: errorMessage, status }, status, {
        cause: err,
      });
    });

    return new PromiseExecutionWrapper(wrappedPromise);
  }

  async throwIfNullish(
    errorMessage: string = 'Resource not found',
    status: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<NonNullable<T>> {
    const result = await this.promise;
    if (result === null || result === undefined) {
      throw new HttpException({ errorMessage, status }, status);
    }
    return result;
  }

  async throwIfEmptyArray(
    errorMessage: string = 'No records found',
    status: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<T> {
    const result = await this.promise;
    if (Array.isArray(result) && result.length === 0) {
      throw new HttpException({ errorMessage, status }, status);
    }

    return result;
  }

  async execute(): Promise<T> {
    return this.promise;
  }
}

export const runPromiseExecution = <T>(
  promise: Promise<T>,
): UnsafeExecution<T> => {
  return PromiseExecutionWrapper.start(promise);
};
