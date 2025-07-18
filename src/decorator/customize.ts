import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = '95AU13MVJgVEjQhrHdHwGp7MC3zsNMCKHh0IY3wVuE4';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
