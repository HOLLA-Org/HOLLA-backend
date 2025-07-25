// import { Injectable, LoggerService } from '@nestjs/common';
// import * as winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// @Injectable()
// export class AppLoggerService implements LoggerService {
//   private readonly logger: winston.Logger;

//   constructor() {
//     this.logger = winston.createLogger({
//       level: 'info',
//       format: winston.format.combine(
//         winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//         winston.format.printf(({ level, message, timestamp, context }) => {
//           return JSON.stringify({ timestamp, level, message, context });
//         }),
//       ),
//       transports: [
//         new winston.transports.Console({
//           format: winston.format.combine(
//             winston.format.colorize(),
//             winston.format.simple(),
//           ),
//         }),
//         new DailyRotateFile({
//           filename: 'logs/application-%DATE%.log',
//           datePattern: 'YYYY-MM-DD',
//           maxFiles: '30d',
//           zippedArchive: true,
//         }),
//         new DailyRotateFile({
//           filename: 'logs/error-%DATE%.log',
//           level: 'error',
//           datePattern: 'YYYY-MM-DD',
//           maxFiles: '30d',
//           zippedArchive: true,
//         }),
//       ],
//     });
//   }

//   log(message: string, context?: string) {
//     this.logger.info({ message, context });
//   }

//   error(message: string, trace?: string, context?: string) {
//     this.logger.error({ message, trace, context });
//   }

//   warn(message: string, context?: string) {
//     this.logger.warn({ message, context });
//   }

//   debug(message: string, context?: string) {
//     this.logger.debug({ message, context });
//   }

//   verbose(message: string, context?: string) {
//     this.logger.verbose({ message, context });
//   }
// }
