import { HttpException, HttpStatus } from '@nestjs/common';

// Interface untuk response dari HttpException
interface HttpExceptionResponse {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

export class ResponseHelper {
  static success(message: string, data: any = []) {
    return {
      meta: {
        message: message,
        code: HttpStatus.OK,
        status: 'success',
        statusText: 'OK',
      },
      data: data,
    };
  }

  static error(message: string, code: number = HttpStatus.BAD_REQUEST) {
    const statusText = HttpStatus[code] || 'UNKNOWN_ERROR';

    throw new HttpException(
      {
        meta: {
          message: message,
          code: code,
          status: 'error',
          statusText: statusText,
        },
        data: null,
      },
      code,
    );
  }

  static handleError(error: unknown) {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const response = error.getResponse() as string | HttpExceptionResponse;

      let errorMessage: string;

      if (typeof response === 'string') {
        errorMessage = response;
      } else if (typeof response === 'object' && 'message' in response) {
        errorMessage = Array.isArray(response.message)
          ? response.message[0]
          : String(response.message);
      } else {
        errorMessage = 'An error occurred';
      }

      return ResponseHelper.error(errorMessage, status);
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return ResponseHelper.error(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Fallback for unknown error types
    return ResponseHelper.error(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
