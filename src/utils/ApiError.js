class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong...",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.data = null;
        this.errors = errors;
        this.message = message;
        this.success = false;
        this.statusCode = statusCode

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.consttuctor);
        }
    }
}
export default ApiError