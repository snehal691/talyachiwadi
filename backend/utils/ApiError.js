class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong from Api",
        errors = [],
        stack = ""
    ){
        super(message),
        this.statusCode = statusCode,
        this.data = null,
        this.success = false,
        this.errors = errors


        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor);
            //targetObj, [constructorOpt]
        }
    }
}

export { ApiError }