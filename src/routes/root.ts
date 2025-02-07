import { FastifyPluginAsync } from "fastify";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get("/", async function () {
        const packageJson = await import("../../package.json");
        return { name: "Fastify API - Lambda", version: packageJson.version };
    });
};

export default root;
