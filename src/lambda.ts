import awsLambdaFastify from "@fastify/aws-lambda";

import fastify from "fastify";
import app from "./app";

const server = fastify({
    logger: true,
});

server.register(app);

const proxy = awsLambdaFastify(server, {
    callbackWaitsForEmptyEventLoop: false,
})

export const handler = async (event: any, context: any): Promise<any> => {
    try {
        const authContext = event.requestContext?.authorizer;
        console.debug(authContext);

        if (authContext) {
            event.headers['authContext'] = JSON.stringify(authContext);
        }
        console.log('-------EVENT LOG---------')
        console.debug(event);
        // Evento HTTP (ou outros eventos)
        return await proxy(event, context);

    } catch (error) {
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing event' }),
        };
    }
}
