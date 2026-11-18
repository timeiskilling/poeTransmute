import { HttpException, HttpStatus } from '@nestjs/common';
import { runPromiseExecution } from '../promiseManager/promiseExecution';
import { PoeNinjaApiResponseSchema } from '../poe2/poe2NinjaDto/characterNinjaZodSchema';
import { access, readFile } from 'node:fs/promises';

// import Bun from 'bun';

// export async function readCharacter(filePath: string) {
//   const file = Bun.file(filePath);

//   if (!(await file.exists())) {
//     throw new HttpException(
//       `File doesn't exist: ${filePath}`,
//       HttpStatus.NOT_FOUND,
//     );
//   }
//   const parsePromise = file.json().then((res: unknown) => {
//     if (res && typeof res === 'object' && 'charModel' in res) {
//       return res.charModel;
//     }

//     throw new Error('Local JSON does not contain object charModel');
//   });

//   const validationResult = await runPromiseExecution(parsePromise)
//     .catchError(
//       `Error parsing JSON at path: ${filePath}`,
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     )
//     .validate(
//       PoeNinjaApiResponseSchema,
//       'Invalid poe.ninja format',
//       HttpStatus.UNPROCESSABLE_ENTITY,
//     )
//     .execute();

//   return validationResult;
// }

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readCharacter(filePath: string) {
  if (!(await fileExists(filePath))) {
    throw new HttpException(
      `File doesn't exist: ${filePath}`,
      HttpStatus.NOT_FOUND,
    );
  }

  const parsePromise = readFile(filePath, 'utf-8').then((raw) => {
    const res: unknown = JSON.parse(raw);

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
