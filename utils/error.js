import createError from "http-errors";

export const errorMiddleware = (
    err, req, res, next
) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";



    
    //   mongodb error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = createError(400, message);
    }

    // duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err =  createError(400, message);
    }

    //  jwt error
    if(err.name === "JsonWebTokenError"){
        const message = "Json web token is invalid, try again";
        err = createError(400, message);
    }
     //  jwt expaired error
     if(err.name === "TokenExpiredError"){
        const message = "Json web token is expired, try again";
        err = createError(400, message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}