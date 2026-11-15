import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const body =
      exception instanceof HttpException ? exception.getResponse() : null;
    const value =
      typeof body === 'string'
        ? body
        : body && typeof body === 'object' && 'message' in body
          ? (body as { message: unknown }).message
          : null;
    const message = Array.isArray(value)
      ? value.join(', ')
      : typeof value === 'string'
        ? value
        : 'Internal server error';

    response.status(status).json({ error: message });
  }
}
