import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import * as express from "express";
import HttpException from "../exceptions/Http.exception";

const dtoValidation =
  <T extends object>(type: new () => T): express.RequestHandler =>
  async (req, res, next) => {
    const object = plainToClass(type, req.body);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error: ValidationError) => ({
        property: error.property,
        errors: {
          ...error.constraints,
        },
      }));

      next(
        new HttpException(
          400,
          "Validation failed",
          "VALIDATION_ERROR",
          messages,
        ),
      );
      return;
    }

    req.validatedBody = object;
    next();
  };

const emptyBodyValidation = (): express.RequestHandler => {
  return (req, _res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      next(
        new HttpException(
          400,
          "Нужно передать body в запрос",
          "EMPTY_REQUEST_BODY",
        ),
      );
      return;
    }
    next();
  };
};

export { dtoValidation, emptyBodyValidation };
