import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import { formatISO } from 'date-fns';
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { join } from "path";

import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../.env") });

export interface AppOptions
    extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> { }
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {

    // Registrar o plugin fastify-cors
    void fastify.register(fastifyCors, {
        origin: "*",  // Permitir todas as origens; ajuste conforme necessário
        methods: "*",  // Métodos permitidos
        allowedHeaders: "*",  // Cabeçalhos permitidos
        credentials: false  // Permitir envio de cookies e cabeçalhos de autenticação
    });

    // Middleware for logging incoming requests
    fastify.addHook('onRequest', (request, reply, done) => {
        console.log(`Request received: ${request.method} ${request.url}`);
        console.log('Headers:', request.headers);
        done();
    });

    // Middleware for logging outgoing responses
    fastify.addHook('onSend', (request, reply, payload, done) => {
        console.log(`Response sent: ${reply.statusCode} for ${request.method} ${request.url}`);
        console.log('Payload:', payload);
        done();
    });

    // Error handler for logging errors
    fastify.setErrorHandler((error, request, reply) => {
        console.error(`Error in request: ${request.method} ${request.url}`);
        console.error('Error details:', error);
        const errorResponse = {
            message: `Error details: ${error}`,
            error: {
                statusCode: 400,
                requestDateTime: formatISO(Date.now()),
                name: "Bad Request"
            }
        };
        reply.status(400).send(errorResponse);
    });

    void fastify.register(AutoLoad, {
        dir: join(__dirname, "routes"),
        options: opts,
    });

};

export default app;
export { app, options };

