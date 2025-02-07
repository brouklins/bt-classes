import ContractEntity from "../models/ContractEntity";
import ContractModelDTO from "../models/ContractModelDTO";

export default interface IContractModelMapper {
    contractDtoToContractEntity(studentDTO: ContractModelDTO): Promise<ContractEntity>;
    updateContractEntityFromDTO(existingEntity: ContractEntity, updateDTO: Partial<ContractModelDTO>): Promise<ContractEntity>;
}