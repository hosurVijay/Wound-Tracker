class ApiError extends Error {
    constructor(
        statusCode,
        message,
        error = [],
        stack = "",
    ) {
        super(message);
        this.message = message;
        this.error = error;
        this.statusCode = statusCode;

        if (stack) {
        this.stack = stack;
        }else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


export {ApiError}