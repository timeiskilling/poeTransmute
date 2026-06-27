import { HttpException, HttpStatus } from '@nestjs/common';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { PoeNinjaApiResponseSchema } from 'src/poe2/poe2NinjaDto/characterNinjaZodSchema';
import Bun from 'bun';

export async function readCharacter(filePath: string) {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new HttpException(
      `File doesn't exist: ${filePath}`,
      HttpStatus.NOT_FOUND,
    );
  }
  const parsePromise = file.json().then((res: unknown) => {
    if (res && typeof res === 'object' && 'charModel' in res) {
      return res.charModel;
    }

    throw new Error('Local JSON does not contain object charModel');
  });

  const validationResult = await runPromiseExecution(parsePromise)
    .catchError(
      `Error parsing JSON at path: ${filePath}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    .validate(
      PoeNinjaApiResponseSchema,
      'Invalid poe.ninja format',
      HttpStatus.UNPROCESSABLE_ENTITY,
    )
    .execute();

  return validationResult;
}
