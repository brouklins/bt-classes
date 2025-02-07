import { FastifyReply } from "fastify";
import { CustomError } from "./CustomError";

export class ErrorHandler {
    static handleErrors(error: any, reply: FastifyReply): void {
        if (error instanceof CustomError && error.statusCode === 204) {
            reply.status(error.statusCode).send();
        } else if (error instanceof CustomError) {
            reply.status(error.statusCode).send({ message: error.message, error });
        } else {
            reply.status(500).send({ message: "Internal server error" });
        }
    }
}