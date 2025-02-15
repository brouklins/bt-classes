import { inject, injectable } from "inversify";
import { CustomError } from "../external/exception/CustomError";
import IContractModelMapper from "../mapper/IContractModelMapper";
import ContractEntity from "../models/ContractEntity";
import { default as ContractModelDTO } from "../models/ContractModelDTO";
import WeeklyCalendarModel from "../models/WeeklyCalendarModel";
import ContractRepository from "../repository/ContractRepository";
import IContractUseCase from "./IContractUseCase";

@injectable()
export default class ContractUseCaseImpl implements IContractUseCase {

    private readonly contractModelMapper: IContractModelMapper;

    constructor(@inject('IContractModelMapper') contractModelMapper: IContractModelMapper) {
        this.contractModelMapper = contractModelMapper;
    }

    async createContract(contractDto: ContractModelDTO, userId: string): Promise<string> {

        console.log("---------------START TO CREATE--------------")

        this.checkUserId(userId, contractDto.instructor_id);

        console.log("---------------USER ID CHECKED--------------")

        const contractRepository = await ContractRepository.create();

        const exist = await contractRepository.studentContractExist(contractDto.student_id);

        console.log("---------------STUDENT EXIST--------------")

        if (exist) {
            throw new CustomError(
                409,
                `Cannot create this contract because student ${contractDto.student_id} already have contract`,
                "CONFLICT"
            );
        }

        const entity = await this.contractModelMapper.contractDtoToContractEntity(contractDto);

        console.log("---------------FEITO MAPPER--------------")

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

    async showWeeklyCalendar(userId: string, referenceDate: Date): Promise<WeeklyCalendarModel> {

        console.log('------------STARTING CALENDAR USECASE---------')
        const contractRepository = await ContractRepository.create();

        const newReferenceDate = new Date(referenceDate);

        console.debug(newReferenceDate);

        const startAndEndofTheWeek = this.getWeekStartAndEnd(newReferenceDate);

        return await contractRepository.selectWeeklyCalendar(userId, startAndEndofTheWeek.startOfWeek, startAndEndofTheWeek.endOfWeek);

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

    private getWeekStartAndEnd(referenceDate: Date): { startOfWeek: Date, endOfWeek: Date } {
        const startOfWeek = new Date(referenceDate);
        startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    }
}