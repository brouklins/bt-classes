import ContractEntity from "../models/ContractEntity";
import ContractModelDTO from "../models/ContractModelDTO";
import StudentEntity from "../models/StudentEntity";
import WeeklyCalendarModel from "../models/WeeklyCalendarModel";

export default interface IContractUseCase {
    createContract(contractDto: ContractModelDTO, userId: string): Promise<string>;
    listContractsByInstructor(instructorId: string): Promise<ContractEntity[]>;
    showContractById(contractId: string, userId: string): Promise<ContractEntity>;
    updateContract(contractDto: Partial<ContractModelDTO>, contractId: string, userId: string): Promise<ContractEntity>;
    deleteContract(contractId: string, userId: string): Promise<void>;
    showWeeklyCalendar(userId: string, referenceDate: Date): Promise<WeeklyCalendarModel>;
    showClassByDateAndTime(userId: string, selectedDate: Date, selectedDay: string, targetTime: string): Promise<StudentEntity[]>;
}