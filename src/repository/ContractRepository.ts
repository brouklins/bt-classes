
import { Pool } from 'pg';
import { PostgresConfig } from '../external/config/PostgresConfig';
import ContractEntity, { Schedule } from '../models/ContractEntity';
import StudentEntity from '../models/StudentEntity';
import WeeklyCalendarModel from '../models/WeeklyCalendarModel';

export default class ContractRepository {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    static async create(): Promise<ContractRepository> {
        const database = new PostgresConfig();
        const pool = await database.initialize();
        return new ContractRepository(pool);
    }

    async insert(entity: ContractEntity): Promise<void> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        if (!client) {
            console.error('No Database Client Available');
            return;
        }

        try {
            await client.query('BEGIN');
            await client.query(
                `
            INSERT INTO bt.contracts (
                id,
                student_id,
                instructor_id,
                start_date,
                end_date,
                sessions_per_week,
                days_of_week,
                schedule,
                total_sessions,
                completed_sessions,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `,
                [
                    entity.id,
                    entity.student_id,
                    entity.instructor_id,
                    entity.start_date,
                    entity.end_date,
                    entity.sessions_per_week,
                    entity.days_of_week.join(','), // Converte array em string se necessário
                    entity.schedule,
                    entity.total_sessions,
                    entity.completed_sessions,
                    entity.status,
                ]
            );
            await client.query('COMMIT');
        } catch (error: any) {
            console.error('Error inserting data into postgres, performing rollback:', error);
            // Faz o rollback em caso de erro
            await client.query('ROLLBACK');
            throw error; // Relança o erro para ser tratado pelo chamador
        } finally {
            // Libera o cliente de volta para o pool de conexões
            client.release();
        }
    }

    async listAllContractsByInstructor(instructorId: string): Promise<ContractEntity[]> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            const result = await client.query(
                'SELECT * FROM bt.contracts WHERE instructor_id = $1',
                [instructorId]
            );

            return result.rows.map(row => ({
                id: row.id,
                student_id: row.student_id,
                instructor_id: row.instructor_id,
                start_date: row.start_date,
                end_date: row.end_date,
                sessions_per_week: row.sessions_per_week,
                days_of_week: row.days_of_week.split(','),  // Converte a string de volta para um array
                schedule: row.schedule,
                total_sessions: row.total_sessions,
                completed_sessions: row.completed_sessions,
                status: row.status
            }));
        } catch (error: any) {
            console.error('Error fetching data from postgres:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async findByStudentId(studentId: string): Promise<ContractEntity> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            const result = await client.query('SELECT * FROM bt.contracts WHERE student_id = $1', [studentId]);

            const row = result.rows[0];
            return {
                id: row.id,
                student_id: row.student_id,
                instructor_id: row.instructor_id,
                start_date: row.start_date,
                end_date: row.end_date,
                sessions_per_week: row.sessions_per_week,
                days_of_week: row.days_of_week.split(','),  // Converte a string de volta para um array
                schedule: row.schedule,
                total_sessions: row.total_sessions,
                completed_sessions: row.completed_sessions,
                status: row.status
            };
        } catch (error: any) {
            console.error('Error fetching data from postgres:', error);
            throw error;
        } finally {
            client.release();
        }
    }


    async findByContractId(contractId: string): Promise<ContractEntity> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            const result = await client.query('SELECT * FROM bt.contracts WHERE id = $1', [contractId]);

            const row = result.rows[0];
            return {
                id: row.id,
                student_id: row.student_id,
                instructor_id: row.instructor_id,
                start_date: row.start_date,
                end_date: row.end_date,
                sessions_per_week: row.sessions_per_week,
                days_of_week: row.days_of_week.split(','),  // Converte a string de volta para um array
                schedule: row.schedule,
                total_sessions: row.total_sessions,
                completed_sessions: row.completed_sessions,
                status: row.status
            }
        } catch (error: any) {
            console.error('Error fetching data from postgres:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateContract(entity: ContractEntity): Promise<void> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            await client.query('BEGIN');

            await client.query(
                `
            UPDATE bt.contracts
            SET 
                student_id = $1,
                instructor_id = $2,
                start_date = $3,
                end_date = $4,
                sessions_per_week = $5,
                days_of_week = $6,
                schedule = $7,
                total_sessions = $8,
                completed_sessions = $9,
                status = $10
            WHERE id = $11
            `,
                [
                    entity.student_id,
                    entity.instructor_id,
                    entity.start_date,
                    entity.end_date,
                    entity.sessions_per_week,
                    entity.days_of_week.join(','), // Converte o array de volta para uma string
                    entity.schedule,
                    entity.total_sessions,
                    entity.completed_sessions,
                    entity.status,
                    entity.id
                ]
            );

            await client.query('COMMIT');
        } catch (error: any) {
            console.error('Error updating contract in postgres, performing rollback:', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<void> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM bt.contracts WHERE id = $1', [id]);
            await client.query('COMMIT');
        } catch (error: any) {
            console.error('Error deleting data from postgres, performing rollback:', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async studentContractExist(student_id: String): Promise<boolean> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        if (!client) {
            console.error('No Database Client Available');
        }

        try {
            const result = await client.query(
                'SELECT 1 FROM bt.contracts WHERE student_id = $1 LIMIT 1',
                [student_id]
            );

            console.log(result);

            return (result?.rowCount !== undefined && result?.rowCount !== null)
                ? result.rowCount > 0
                : (() => { throw new Error("result or rowCount is null or undefined"); })();

        } catch (error: any) {
            console.error('Error inserting data into postgres, performing rollback:', error);
            throw error; // Relança o erro para ser tratado pelo chamador
        } finally {
            // Libera o cliente de volta para o pool de conexões
            client.release();
        }
    }

    async contractExist(contractId: String): Promise<boolean> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        if (!client) {
            console.error('No Database Client Available');
        }

        try {
            const result = await client.query(
                'SELECT 1 FROM bt.contracts WHERE id = $1 LIMIT 1',
                [contractId]
            );

            console.log(result);

            return (result?.rowCount !== undefined && result?.rowCount !== null)
                ? result.rowCount > 0
                : (() => { throw new Error("result or rowCount is null or undefined"); })();

        } catch (error: any) {
            console.error('Error inserting data into postgres, performing rollback:', error);
            throw error; // Relança o erro para ser tratado pelo chamador
        } finally {
            // Libera o cliente de volta para o pool de conexões
            client.release();
        }
    }

    async instructorExist(instructorId: String): Promise<boolean> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        if (!client) {
            console.error('No Database Client Available');
        }

        try {
            const result = await client.query(
                'SELECT 1 FROM bt.contracts WHERE instructor_id = $1 LIMIT 1',
                [instructorId]
            );

            console.log(result);

            return (result?.rowCount !== undefined && result?.rowCount !== null)
                ? result.rowCount > 0
                : (() => { throw new Error("result or rowCount is null or undefined"); })();

        } catch (error: any) {
            console.error('Error inserting data into postgres, performing rollback:', error);
            throw error; // Relança o erro para ser tratado pelo chamador
        } finally {
            // Libera o cliente de volta para o pool de conexões
            client.release();
        }
    }

    async selectWeeklyCalendar(instructorId: string, startOfWeek: Date, endOfWeek: Date): Promise<WeeklyCalendarModel> {
        console.log('-------STARTING CALENDAR REPOSITORY--------');
        const client = await this.pool.connect();

        type WeekDays = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

        await client.query('SET search_path TO bt;');

        try {
            const result = await client.query(
                `SELECT days_of_week, schedule, end_date, start_date 
             FROM bt.contracts 
             WHERE instructor_id = $1 
             AND start_date <= $2::date 
             AND end_date >= $3::date 
             AND status = 'ACTIVE'`,
                [instructorId, endOfWeek, startOfWeek]
            );

            console.log('--------------SQL QUERY RESULT--------');
            console.debug(result);

            const calendar: WeeklyCalendarModel = {
                Segunda: [],
                Terça: [],
                Quarta: [],
                Quinta: [],
                Sexta: [],
                Sábado: [],
                Domingo: []
            };

            const daysOfWeekMap: Record<WeekDays, number> = {
                'Segunda': 1,
                'Terça': 2,
                'Quarta': 3,
                'Quinta': 4,
                'Sexta': 5,
                'Sábado': 6,
                'Domingo': 0
            };

            result.rows.forEach(row => {
                const days: string[] = row.days_of_week.split(',');
                const schedule: Schedule = row.schedule;
                const contractStartDate = new Date(row.start_date);
                const contractEndDate = new Date(row.end_date);

                days.forEach(day => {
                    const dayTrimmed = day.trim() as WeekDays;
                    const dayIndex = daysOfWeekMap[dayTrimmed];
                    const dateForDay = new Date(startOfWeek);
                    dateForDay.setDate(startOfWeek.getDate() + dayIndex);

                    if (schedule[dayTrimmed] && dateForDay <= contractEndDate && dateForDay >= contractStartDate) {
                        const uniqueTimes = new Set(calendar[dayTrimmed].concat(schedule[dayTrimmed]));
                        calendar[dayTrimmed] = Array.from(uniqueTimes);
                    }
                });
            });

            console.debug(calendar);
            return calendar;

        } catch (error: any) {
            console.error('Error fetching data from postgres:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getStudentsWithClassAtTime(instructorId: string, selectedDate: Date, selectedDay: string, targetTime: string): Promise<string[]> {
        const client = await this.pool.connect();

        await client.query('SET search_path TO bt;');

        try {
            const result = await client.query(
                `SELECT student_id, schedule
             FROM contracts
             WHERE instructor_id = $1
             AND status = 'ACTIVE'
             AND start_date <= $2::date
             AND end_date >= $2::date
             AND days_of_week ILIKE '%' || $3 || '%'`,
                [instructorId, selectedDate, selectedDay]
            );

            const studentsWithClass: string[] = [];

            result.rows.forEach(row => {
                const schedule = row.schedule as { [key: string]: string[] };
                const daySchedule = schedule[selectedDay]; // Obter horários para o dia específico

                if (daySchedule && daySchedule.includes(targetTime)) {
                    studentsWithClass.push(row.student_id); // Adiciona o aluno se o targetTime estiver no array
                }
            });

            return studentsWithClass;
        } catch (error: any) {
            console.error('Error fetching data from postgres:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getStudentsByIds(studentIds: string[]): Promise<StudentEntity[]> {
        if (studentIds.length === 0) {
            return []; // Retorna um array vazio se não houver IDs
        }

        const client = await this.pool.connect();

        try {
            const result = await client.query(
                `SELECT id, user_id AS "userId", name, phone, email
                 FROM students
                 WHERE id = ANY($1::varchar[])`,
                [studentIds]
            );

            const students: StudentEntity[] = result.rows.map(row => ({
                id: row.id,
                userId: row.userId,
                name: row.name,
                phone: row.phone,
                email: row.email
            }));

            return students;
        } catch (error: any) {
            console.error('Error fetching students by IDs:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
