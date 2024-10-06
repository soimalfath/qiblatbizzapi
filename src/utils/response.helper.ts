export class ResponseHelper {
  static success(message: string, data: any = []) {
    return {
      meta: {
        message: message,
        code: 200,
        status: 'success',
      },
      data: data,
    };
  }

  static error(message: string, code: number = 400) {
    return {
      meta: {
        message: message,
        code: code,
        status: 'error',
      },
      data: null,
    };
  }
}
