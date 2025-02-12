import { inject, injectable } from "inversify";
import { CustomError } from "../external/exception/CustomError";
import IContractModelMapper from "../mapper/IContractModelMapper";
import ContractEntity from "../models/ContractEntity";
import { default as ContractModelDTO } from "../models/ContractModelDTO";
import ContractRepository from "../repository/ContractRepository";
import IContractUseCase from "./IContractUseCase";

@injectable()
export default class ContractUseCaseImpl implements IContractUseCase {

    private readonly contractModelMapper: IContractModelMapper;

    constructor(@inject('IContractModelMapper') contractModelMapper: IContractModelMapper) {
        this.contractModelMapper = contractModelMapper;
    }

    async createContract(contractDto: ContractModelDTO, userId: string): Promise<string> {

        this.checkUserId(userId, contractDto.instructor_id);

        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.studentContractExist(contractDto.student_id);

        if (exist) {
            throw new CustomError(
                409,
                `Cannot create this contract because student ${contractDto.student_id} already have contract`,
                "CONFLICT"
            );
        }

        const entity = await this.contractModelMapper.contractDtoToContractEntity(contractDto);

        await contractRepository.insert(entity);

        return entity.id;
    }
    async listContractsByInstructor(instructorId: string): Promise<ContractEntity[]> {
        const contractRepository = await ContractRepository.create();

        return await contractRepository.listAllContractsByInstructor(instructorId);

    }
    async showContractById(contractId: string, userId: string): Promise<ContractEntity> {
        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        const targetContract = await contractRepository.findByContractId(contractId);

        this.checkUserId(userId, targetContract.instructor_id);

        return targetContract;
    }
    async updateContract(contractDto: Partial<ContractModelDTO>, contractId: string, userId: string): Promise<ContractEntity> {
        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        const existingEntity = await this.showContractById(contractId, userId);

        const entity = await this.contractModelMapper.updateContractEntityFromDTO(existingEntity, contractDto);

        await contractRepository.updateContract(entity);

        return entity;
    }

    async deleteContract(contractId: string, userId: string): Promise<void> {
        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        await this.showContractById(contractId, userId);

        await contractRepository.delete(contractId);
    }

    //Checar se o userid do jwt token é o mesmo userid do contract
    private checkUserId(jwtUserId: string, targetUserId: string) {
        if (jwtUserId !== targetUserId) {
            throw new CustomError(
                401,
                `Unauthorized`,
                "UNAUTHORIZED"
            );
        }
    }
}