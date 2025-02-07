import { injectable } from 'inversify';
import { Pool } from 'pg';
import AwsSecretsManager from "./AwsSecretManager";
import { environment } from './Environment';

@injectable()
export class PostgresConfig {
    private static pool: Pool;

    async initialize(): Promise<Pool> {
        if (!PostgresConfig.pool) {
            const config = await this.dbClientConfig();
            PostgresConfig.pool = new Pool(config);

            try {
                const client = await PostgresConfig.pool.connect();
                try {
                    await client.query('CREATE SCHEMA IF NOT EXISTS bt;');
                    await client.query('SET search_path TO bt;');

                    await client.query(`
                                        CREATE TABLE IF NOT EXISTS contracts (
                                        id VARCHAR(254) PRIMARY KEY,
                                        student_id VARCHAR(254) REFERENCES students(id) ON DELETE CASCADE,
                                        instructor_id VARCHAR(254) REFERENCES users(id) ON DELETE SET NULL, -- Referência ao professor
                                        start_date DATE NOT NULL,
                                        end_date DATE NOT NULL,
                                        sessions_per_week INT CHECK (sessions_per_week BETWEEN 1 AND 5),
                                        days_of_week VARCHAR(50) NOT NULL, -- 'Monday,Wednesday'
                                        total_sessions INT NOT NULL,
                                        completed_sessions INT DEFAULT 0,
                                        status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELED')) NOT NULL
                                    );
                                    `);
                } finally {
                    client.release();
                }
            } catch (error: any) {
                console.error('PostgresConfig Class Error setting up postgres schema and tables:', error.message);
                throw error;
            }
        }

        return PostgresConfig.pool;
    }

    async dbClientConfig(): Promise<any> {
        const awsSecret = new AwsSecretsManager();

        const postgresCredentials = await awsSecret.getDbCredentials(environment.pgCredentialsSecret);

        let config: any = {
            user: process.env.DB_USERNAME || postgresCredentials?.username || '',
            host: process.env.DB_HOST || '',
            database: process.env.DB_DATABASE || '',
            password: process.env.DB_PASSWORD || postgresCredentials?.password || '',
            port: parseInt(process.env.DB_PORT || ''),
        };

        if (environment.nodeEnv !== "local") {
            config.ssl = {
                ca: environment.caCertPath,
                rejectUnauthorized: false,
            };
        }
        return config;
    }
}