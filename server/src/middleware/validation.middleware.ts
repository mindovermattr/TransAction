import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import * as express from "express";
import HttpException from "../exceptions/Http.exception";

const validationMiddleware =
  <T extends object>(type: new () => T): express.RequestHandler =>
  (req, _, next) => {
    const object = plainToClass(type, req.body);
    validate(object).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const messages = errors
          .map((error: ValidationError) =>
            Object.values(error.constraints || {}).join(", ")
          )
          .join(", ");
        next(new HttpException(400, messages));
      } else {
        next();
      }
    });
  };

export default validationMiddleware;
