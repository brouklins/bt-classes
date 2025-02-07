import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import ContractEntity from '../models/ContractEntity';
import ContractModelDTO from '../models/ContractModelDTO';
import IContractModelMapper from './IContractModelMapper';

@injectable()
export default class ContractModelMapperImpl implements IContractModelMapper {
    async contractDtoToContractEntity(contractDTO: ContractModelDTO): Promise<ContractEntity> {

        const trialPeriodDays = 30;

        const sessionPerWeek = await this.calculateSessionsPerWeek(contractDTO.days_of_week);

        const endDate = new Date(contractDTO.start_date.getTime() + trialPeriodDays * 24 * 60 * 60 * 1000);

        const numberOfWeeks = await this.calculateWeeksBetween(contractDTO.start_date, endDate);

        const totalSessions = numberOfWeeks * sessionPerWeek;

        return {
            id: uuidv4(),
            student_id: contractDTO.student_id,
            instructor_id: contractDTO.instructor_id,
            start_date: contractDTO.start_date,
            end_date: endDate,
            sessions_per_week: sessionPerWeek,
            days_of_week: contractDTO.days_of_week,
            completed_sessions: 0,
            total_sessions: totalSessions,
            status: 'ACTIVE',
        };
    }

    async updateContractEntityFromDTO(
        existingEntity: ContractEntity,
        updateDTO: Partial<ContractModelDTO>
    ): Promise<ContractEntity> {

        // Use a data de início fornecida ou mantenha a existente
        const startDate = updateDTO.start_date ?? existingEntity.start_date;

        // Recalcular a data de término fixando 30 dias após a data de início
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Use os dias da semana fornecidos ou mantenha os existentes
        const daysOfWeek = updateDTO.days_of_week ?? existingEntity.days_of_week;

        // Recalcular o número de sessões por semana e total de sessões
        const sessionsPerWeek = await this.calculateSessionsPerWeek(daysOfWeek);
        const numberOfWeeks = await this.calculateWeeksBetween(startDate, endDate);
        const totalSessions = numberOfWeeks * sessionsPerWeek;

        return {
            id: existingEntity.id,
            student_id: existingEntity.student_id,
            instructor_id: existingEntity.instructor_id,
            start_date: startDate,
            end_date: endDate,
            sessions_per_week: sessionsPerWeek,
            days_of_week: daysOfWeek,
            completed_sessions: existingEntity.completed_sessions,
            total_sessions: totalSessions,
            status: updateDTO.status ?? existingEntity.status
        };
    }

    // Função auxiliar para calcular o número de semanas entre duas datas
    private async calculateWeeksBetween(startDate: Date, endDate: Date): Promise<number> {
        const oneWeekMilliseconds = 7 * 24 * 60 * 60 * 1000;
        return Math.ceil((endDate.getTime() - startDate.getTime()) / oneWeekMilliseconds);
    }

    private async calculateSessionsPerWeek(daysOfWeek: string[]): Promise<number> {
        return daysOfWeek.length;
    }
}