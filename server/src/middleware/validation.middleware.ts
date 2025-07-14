import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import * as express from "express";



const dtoValidation =
  <T extends object>(type: new () => T): express.RequestHandler =>
  (req, res, next) => {
    const object = plainToClass(type, req.body);
    validate(object).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const messages = errors.map((error: ValidationError) => {
          return {
            property: error.property,
            errors: {
              ...error.constraints,
            },
          };
        });

        res.status(400).json(messages);
      } else {
        req.validatedBody = object
        next();
      }
    });
  };

const emptyBodyValidation = (): express.RequestHandler => {
  return (req, res, next) => {
    if (!req.body) {
      res.status(404).json({
        error: "Нужно передать body в запрос",
      });
      return;
    }
    next();
  };
};

export { dtoValidation, emptyBodyValidation };
