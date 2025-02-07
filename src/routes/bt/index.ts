import { FastifyPluginAsync } from "fastify";
import ConctractController from "../../controllers/ConctractController";
import { container } from "../../external/config/InjectionContainer";

const studentRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    const contractController = container.resolve(ConctractController);

    fastify.post("/contracts", contractSchema, contractController.create.bind(contractController));
    fastify.get("/contracts", headerUserIdSchema, contractController.list.bind(contractController));
    fastify.get("/contracts/:id", contractController.show.bind(contractController));
    fastify.put("/contracts/:id", updateContractSchema, contractController.update.bind(contractController));
    fastify.delete("/contracts/:id", contractController.delete.bind(contractController));

}

const headerUserIdSchema = {
    schema: {
        headers: {
            type: "object",
            properties: {
                userId: { type: "string", minLength: 1 }
            },
            required: ["userId"]
        }
    }
}

const contractSchema = {
    schema: {
        body: {
            type: "object",
            properties: {
                student_id: { type: "string", minLength: 1 },
                instructor_id: { type: "string", minLength: 1 },
                start_date: { type: "string", format: "date-time" }, // ISO 8601 format for date
                days_of_week: {
                    type: "array",
                    items: { type: "string", minLength: 1 },
                    minItems: 1 // At least one day must be specified
                },
                status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE", "CANCELED"]
                }
            },
            required: ["student_id", "instructor_id", "start_date", "days_of_week", "status"]
        }
    }
};

const updateContractSchema = {
    schema: {
        body: {
            type: "object",
            properties: {
                student_id: { type: "string", minLength: 1 },
                instructor_id: { type: "string", minLength: 1 },
                start_date: { type: "string", format: "date-time" }, // ISO 8601 format for date
                days_of_week: {
                    type: "array",
                    items: { type: "string", minLength: 1 },
                    minItems: 1 // At least one day must be specified
                },
                status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE", "CANCELED"]
                }
            }
        }
    }
};

export default studentRoutes;
