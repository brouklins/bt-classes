import ContractEntity from "../models/ContractEntity";
import ContractModelDTO from "../models/ContractModelDTO";

export default interface IContractUseCase {
    createContract(contractDto: ContractModelDTO, userId: string): Promise<string>;
    listContractsByInstructor(instructorId: string): Promise<ContractEntity[]>;
    showContractById(contractId: string, userId: string): Promise<ContractEntity>;
    updateContract(contractDto: Partial<ContractModelDTO>, contractId: string, userId: string): Promise<ContractEntity>;
    deleteContract(contractId: string, userId: string): Promise<void>;
}