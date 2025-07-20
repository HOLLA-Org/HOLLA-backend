// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { AppLoggerService } from '../logger/logger.service';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   constructor(private readonly logger: AppLoggerService) {}

//   use(req: Request, res: Response, next: NextFunction) {
//     const startTime = Date.now();
//     const { method, originalUrl, body, query, headers } = req;
//     const requestId =
//       headers['x-request-id'] || Math.random().toString(36).substring(7);

//     res.on('finish', () => {
//       const duration = Date.now() - startTime;

//       const logMessage = {
//         requestId,
//         method,
//         url: originalUrl,
//         body,
//         query,
//         statusCode: res.statusCode,
//         responseTime: `${duration}ms`,
//         timestamp: new Date().toISOString(),
//       };

//       this.logger.log(JSON.stringify(logMessage), 'HTTP Request');
//     });

//     next();
//   }
// }
