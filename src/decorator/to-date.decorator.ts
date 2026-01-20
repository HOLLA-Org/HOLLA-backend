import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { format, parse } from 'date-fns';

export function ToDate() {
  return Transform(({ value, key }) => {
    if (value instanceof Date) return value;

    if (typeof value !== 'string') {
      throw new BadRequestException(
        `Date value for "${key}" must be a string.`,
      );
    }
    
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    try {
      const fullDateString = `${value}/${new Date().getFullYear()}`;
      const parsedDate = parse(
        fullDateString,
        'HH:mm dd/MM/yyyy',
        new Date(),
      );

      if (isNaN(parsedDate.getTime())) {
        throw new Error();
      }

      return parsedDate;
    } catch {
      throw new BadRequestException(
        `Invalid date format for "${key}". Use ISO 8601 or "HH:mm DD/MM".`,
      );
    }
  });
}

export function FormatDate(pattern = 'HH:mm dd/MM') {
  return Transform(({ value }) => {
    if (!(value instanceof Date)) return value;
    return format(value, pattern);
  });
}
