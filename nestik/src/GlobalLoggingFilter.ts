import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as util from 'util';

@Catch()
export class GlobalLoggingFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException && exception.cause) {
      const status = exception.getStatus();
      const cause = exception.cause;

      const formattedCause =
        cause instanceof Error
          ? cause.stack
          : util.inspect(cause, { depth: 3, colors: false });

      this.logger.error(
        `[HTTP ${status}] error: ${exception.message}`,
        formattedCause,
      );
    }

    super.catch(exception, host);
  }
}
