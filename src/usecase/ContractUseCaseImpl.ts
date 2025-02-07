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

    async createContract(contractDto: ContractModelDTO): Promise<string> {

        const studentRepository = await ContractRepository.create();

        const exist = await studentRepository.studentContractExist(contractDto.student_id);

        if (exist) {
            throw new CustomError(
                409,
                `Cannot create this contract because student ${contractDto.student_id} already have contract`,
                "CONFLICT"
            );
        }

        const entity = await this.contractModelMapper.contractDtoToContractEntity(contractDto);

        await studentRepository.insert(entity);

        return entity.id;
    }
    async listContractsByInstructor(instructorId: string): Promise<ContractEntity[]> {
        const contractRepository = await ContractRepository.create();

        return await contractRepository.listAllContractsByInstructor(instructorId);

    }
    async showContractById(contractId: string): Promise<ContractEntity> {
        const studentRepository = await ContractRepository.create();

        const exist = await studentRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        return await studentRepository.findByContractId(contractId);
    }
    async updateContract(contractDto: Partial<ContractModelDTO>, contractId: string): Promise<ContractEntity> {
        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        const existingEntity = await this.showContractById(contractId);

        const entity = await this.contractModelMapper.updateContractEntityFromDTO(existingEntity, contractDto);

        await contractRepository.updateContract(entity);

        return entity;
    }

    async deleteContract(contractId: string): Promise<void> {
        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.contractExist(contractId);

        if (!exist) {
            throw new CustomError(
                404,
                `Contract ID: ${contractId} does not exist`,
                "NOT FOUND"
            );
        }

        await contractRepository.delete(contractId);
    }
}