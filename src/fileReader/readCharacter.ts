import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { PoeNinjaApiResponseSchema } from 'src/poe2/poe2NinjaDto/characterNinjaZodSchema';
import Bun from 'bun';
import { PoeNinjaAdapter } from 'src/poe2/adapters/PoeNinjaAdapter';

export async function readCharacter(filePath: string) {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return { status: 'error', reason: "File doesn't exist", details: null };
  }

  const validationResult = await runPromiseExecution(file.json())
    .catchError(`Error parsing JSON at path: ${filePath}`)
    .validate(PoeNinjaApiResponseSchema, 'Invalid poe.ninja format')
    .executeSafeResult();

  if (validationResult.status === 'error') {
    return validationResult;
  }

  const adapter = new PoeNinjaAdapter(validationResult.data);
  const cleanProfile = adapter.getNormalizedProfile();

  return {
    status: 'success',
    data: cleanProfile,
  };
}
