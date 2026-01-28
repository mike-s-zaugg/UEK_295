import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { finalize, Observable } from 'rxjs';
import { randomInt } from 'node:crypto';
import { CorrelationIdRequest } from '../decorators/correlation-id-request';

/**
 * HttpMetaInterceptor is a NestJS interceptor that enhances HTTP metadata for requests and responses.
 * It adds a correlation ID and response time headers to the HTTP response and logs the request details.
 * This interceptor can be useful for debugging, performance monitoring, and request tracing.
 *
 * Responsibilities:
 * - Extracts an existing correlation ID from request headers, or generates a new one if not provided.
 * - Logs the correlation ID, request method, URL, and client IP.
 * - Sets the correlation ID in the response headers to facilitate end-to-end tracing.
 * - Calculates and sets the response time in the response headers for performance monitoring.
 *
 * The correlation ID is also made available in the request object for use in other parts of the application.
 *
 * Implementation Details:
 * - The interceptor uses the `process.hrtime.bigint()` function for high-resolution timing calculations.
 * - The `finalize` operator is employed to ensure headers are set after the request completes, regardless of success or failure.
 * - The `randomInt` utility is used to generate the correlation ID if none is provided in the request headers.
 *
 * Decorators:
 * - `@Injectable()`: Makes this class available as a provider to be used in dependency injection.
 *
 * Implements:
 * - `NestInterceptor`: A core interface in NestJS for implementing custom interceptors.
 *
 * Logs:
 * - Logs each request with correlation ID, method, URL, and IP for traceability.
 */
@Injectable()
export class HttpMetaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Zugriff auf HTTP Response
    const http = context.switchToHttp();
    const req = http.getRequest<CorrelationIdRequest>();
    const res = http.getResponse<Response>();

    // 1) Correlation ID holen oder generieren
    const headerCorrId = req.header('x-correlation-id'); // Express normalisiert Header-Namen

    // 2) Für @CorrId() verfügbar machen
    const correlationId =
      (headerCorrId ? parseInt(headerCorrId?.trim(), 10) : null) ||
      randomInt(10000, 99999);
    req.correlationId = correlationId;

    Logger.log(
      `${req.correlationId} ${req.method} ${req.url} from ${req.ip}`,
      HttpMetaInterceptor.name,
    );

    // Hochauflösender Start-Zeitpunkt
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationNs = process.hrtime.bigint() - start;
        const durationMs = Number(durationNs) / 1_000_000;

        // Correlation ID im Response Header zurückgeben
        res.setHeader('X-Correlation-Id', correlationId);

        // Header setzen (vor dem Senden der Response)
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      }),
    );
  }
}
