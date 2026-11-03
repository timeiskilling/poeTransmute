import { HttpStatus, HttpException, Logger } from '@nestjs/common';
import { treeifyError, z } from 'zod';
import { SafeResult } from 'src/poe2/poe2NinjaDto/zodParser';

export interface UnsafeExecution<T> {
  catchError(errorMessage: string, status?: HttpStatus): SafeExecution<T>;
}

export interface SafeExecution<T> {
  throwIfNullish(
    errorMessage?: string,
    status?: HttpStatus,
  ): Promise<NonNullable<T>>;
  throwIfEmptyArray(errorMessage?: string, status?: HttpStatus): Promise<T>;
  validate<Schema extends z.ZodTypeAny>(
    schema: Schema,
    errorMessage?: string,
    status?: HttpStatus,
  ): SafeExecution<z.infer<Schema>>;
  execute(): Promise<T>;
  executeSafeResult(): Promise<SafeResult<T>>;
}

export interface SafePromisesExecution<T> extends Omit<
  SafeExecution<T[]>,
  'validate'
> {
  validate<Schema extends z.ZodTypeAny>(
    schema: Schema,
    errorMessage?: string,
    status?: HttpStatus,
  ): SafePromisesExecution<z.infer<Schema>>;
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

  validate<Schema extends z.ZodTypeAny>(
    schema: Schema,
    errorMessage: string = 'Validation failed',
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ): SafeExecution<z.infer<Schema>> {
    const validatedPromise = this.promise.then((result) => {
      const parsed = schema.safeParse(result);

      if (!parsed.success) {
        this.logger.error(
          `Validation error: ${errorMessage}`,
          treeifyError(parsed.error),
        );
        throw new HttpException(
          {
            errorMessage,
            status,
            details: parsed.error.issues,
          },
          status,
        );
      }

      return parsed.data;
    });

    return new PromiseExecutionWrapper(validatedPromise);
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

  async executeSafeResult(): Promise<SafeResult<T>> {
    try {
      const data = await this.promise;
      return { status: 'success', data };
    } catch (error: unknown) {
      let reason = 'unknown_error';
      let details: unknown = null;

      if (error instanceof HttpException) {
        const response = error.getResponse();

        if (typeof response === 'object' && response !== null) {
          const resObj = response as Record<string, unknown>;

          if (typeof resObj.errorMessage === 'string') {
            reason = resObj.errorMessage;
          }
          if (resObj.details !== undefined) {
            details = resObj.details;
          }
        }
      } else if (error instanceof Error) {
        reason = error.message;
      }

      return { status: 'error', reason, details };
    }
  }
}

export class PromisesExecutionWrapperBuilder<T>
  implements UnsafePromisesExecution<T>, SafePromisesExecution<T>
{
  private readonly promises: Promise<T>[];

  private constructor(promises: Promise<T>[]) {
    this.promises = promises;
  }

  validate<Schema extends z.ZodTypeAny>(
    schema: Schema,
    errorMessage: string = 'Validation failed for one or more items',
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ): SafePromisesExecution<z.infer<Schema>> {
    const validatedPromises = this.promises.map((promise) =>
      promise.then((result) => {
        const parsed = schema.safeParse(result);
        if (!parsed.success) {
          throw new HttpException(
            { errorMessage, status, details: parsed.error.issues },
            status,
          );
        }
        return parsed.data;
      }),
    );

    return new PromisesExecutionWrapperBuilder(validatedPromises);
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

  async executeSafeResult(): Promise<SafeResult<T[]>> {
    try {
      const data = await Promise.all(this.promises);
      return { status: 'success', data };
    } catch (error: unknown) {
      let reason = 'unknown_error';
      let details: unknown = null;

      if (error instanceof HttpException) {
        const response = error.getResponse();
        if (typeof response === 'object' && response !== null) {
          const resObj = response as Record<string, unknown>;
          if (typeof resObj.errorMessage === 'string') {
            reason = resObj.errorMessage;
          }
          if (resObj.details !== undefined) {
            details = resObj.details;
          }
        }
      } else if (error instanceof Error) {
        reason = error.message;
      }

      return { status: 'error', reason, details };
    }
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
