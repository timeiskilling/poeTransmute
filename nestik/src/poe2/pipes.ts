import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CURRENCY_TYPES, STASH_TYPES } from './db/schema';

export interface ParsedItemType {
  value: string;
  isCurrency: boolean;
  isStash: boolean;
}

@Injectable()
export class ItemTypeValidationPipe implements PipeTransform<
  string,
  ParsedItemType
> {
  transform(type: string): ParsedItemType {
    const isCurrency = (CURRENCY_TYPES as readonly string[]).includes(type);
    const isStash = (STASH_TYPES as readonly string[]).includes(type);

    if (!isCurrency && !isStash) {
      throw new BadRequestException(
        `Invalid type: ${type}. Must be one of the allowed currency or stash types.`,
      );
    }

    return { value: type, isCurrency, isStash };
  }
}
