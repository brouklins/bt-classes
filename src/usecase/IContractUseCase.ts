import ContractEntity from "../models/ContractEntity";
import ContractModelDTO from "../models/ContractModelDTO";

export default interface IContractUseCase {
    createContract(contractDto: ContractModelDTO): Promise<string>;
    listContractsByInstructor(instructorId: string): Promise<ContractEntity[]>;
    showContractById(contractId: string): Promise<ContractEntity>;
    updateContract(contractDto: Partial<ContractModelDTO>, contractId: string): Promise<ContractEntity>;
    deleteContract(contractId: string): Promise<void>;
}