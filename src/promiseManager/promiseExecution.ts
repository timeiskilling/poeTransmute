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

export interface SafePromisesExecution<T> extends SafeExecution<T[]> {
  executeAllSettled(errorMessage?: string, status?: HttpStatus): Promise<T[]>;
}

export interface UnsafePromisesExecution<T> {
  catchError(
    errorMessage: string,
    status?: HttpStatus,
  ): SafePromisesExecution<T>;
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

export class PromisesExecutionWrapperBuilder<T>
  implements UnsafePromisesExecution<T>, SafePromisesExecution<T>
{
  private readonly promises: Promise<T>[];

  private constructor(promises: Promise<T>[]) {
    this.promises = promises;
  }

  static start<T>(promises: Promise<T>[]): UnsafePromisesExecution<T> {
    return new PromisesExecutionWrapperBuilder(promises);
  }

  catchError(
    errorMessage: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): SafePromisesExecution<T> {
    const wrappedPromises = this.promises.map((promise) =>
      promise.catch((err) => {
        throw new HttpException({ err: errorMessage, status }, status, {
          cause: err,
        });
      }),
    );

    return new PromisesExecutionWrapperBuilder(wrappedPromises);
  }

  async throwIfNullish(
    errorMessage: string = 'Resource not found',
    status: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<NonNullable<T[]>> {
    const results = await Promise.all(this.promises);

    if (!results) {
      throw new HttpException({ errorMessage, status }, status);
    }

    return results;
  }

  async throwIfEmptyArray(
    errorMessage: string = 'No records found',
    status: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<T[]> {
    const results = await Promise.all(this.promises);

    if (Array.isArray(results) && results.length === 0) {
      throw new HttpException({ errorMessage, status }, status);
    }

    return results;
  }

  async execute(): Promise<T[]> {
    return Promise.all(this.promises);
  }

  async executeAllSettled(
    errorMessage: string = 'All records failed to process',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Promise<T[]> {
    const result = await Promise.allSettled(this.promises);

    const successfulValues: T[] = [];
    const errors: any[] = [];

    for (const res of result) {
      if (res.status === 'fulfilled') {
        successfulValues.push(res.value);
      } else {
        errors.push(res.reason);
      }
    }

    if (successfulValues.length === 0 && errors.length > 0) {
      throw new HttpException({ errorMessage, status }, status);
    }

    return successfulValues;
  }
}

export const runPromiseExecution = <T>(
  promise: Promise<T>,
): UnsafeExecution<T> => {
  return PromiseExecutionWrapper.start(promise);
};

export const runPromisesExecution = <T>(
  promises: Promise<T>[],
): UnsafePromisesExecution<T> => {
  return PromisesExecutionWrapperBuilder.start(promises);
};
