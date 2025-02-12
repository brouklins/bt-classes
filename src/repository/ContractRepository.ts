
import { Pool } from 'pg';
import { PostgresConfig } from '../external/config/PostgresConfig';
import ContractEntity from '../models/ContractEntity';

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

}