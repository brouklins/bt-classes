import { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'inversify';
import { ErrorHandler } from '../external/exception/ErrorHandler';
import ContractModelDTO from '../models/ContractModelDTO';
import IContractUseCase from '../usecase/IContractUseCase';


@injectable()
export default class ConctractController {

    private readonly contractUseCase: IContractUseCase;

    constructor(@inject('IContractUseCase') contractUseCase: IContractUseCase) {
        this.contractUseCase = contractUseCase;
    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const payload = request.body as ContractModelDTO;

            const contractId = await this.contractUseCase.createContract(payload);

            request.log.info('Success on method signup on ConctractController');
            reply.status(201).send({ id: contractId });
        } catch (error) {
            ErrorHandler.handleErrors(error, reply);
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.headers.userid as string;

            const res = await this.contractUseCase.listContractsByInstructor(userId);

            request.log.info('Success on method list on ConctractController');
            reply.status(200).send(res);
        } catch (error) {
            ErrorHandler.handleErrors(error, reply);
        }
    }

    async show(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: contractId } = request.params as { id: string };

            const res = await this.contractUseCase.showContractById(contractId);

            request.log.info('Success on method show on ConctractController');
            reply.status(200).send(res);
        } catch (error) {
            ErrorHandler.handleErrors(error, reply);
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: contractId } = request.params as { id: string };
            const payload = request.body as Partial<ContractModelDTO>;

            const res = await this.contractUseCase.updateContract(payload, contractId);

            request.log.info('Success on method update on ConctractController');
            reply.status(200).send(res);
        } catch (error) {
            ErrorHandler.handleErrors(error, reply);
        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: contractId } = request.params as { id: string };

            await this.contractUseCase.deleteContract(contractId);

            request.log.info('Success on method delete on ConctractController');
            reply.status(200).send();
        } catch (error) {
            ErrorHandler.handleErrors(error, reply);
        }
    }
}