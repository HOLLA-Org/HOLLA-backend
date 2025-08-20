// src/common/decorators/to-date.decorator.ts

import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { format, parse } from 'date-fns';

export function ToDate() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      throw new BadRequestException('Date value must be a string.');
    }

    try {
      const fullDateString = `${value}/${new Date().getFullYear()}`;
      const parsedDate = parse(fullDateString, 'HH:mm dd/MM/yyyy', new Date());

      if (isNaN(parsedDate.getTime())) {
        throw new Error();
      }
      return parsedDate;
    } catch (error) {
      throw new BadRequestException(
        'Invalid date format. Please use "HH:mm DD/MM".',
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
