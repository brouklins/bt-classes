import path = require("path");

export const environment = {
    nodeEnv: process.env.NODE_ENV || '',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    caCertPath: process.env.CA_CERT_PATH || path.join(__dirname, "../../../", "rds-ca-2019-root.pem"),
    pgVectorDbUserName: process.env.DB_PG_VECTOR_USERNAME || '',
    pgVectorDbHost: process.env.DB_PG_VECTOR_HOST || '',
    pgVectorDbPort: process.env.DB_PG_VECTOR_PORT || '',
    pgVectorDbName: process.env.DB_PG_VECTOR_DATABASE || '',
    pgVectorDbPassword: process.env.DB_PG_VECTOR_PASSWORD || '',
    pgCredentialsSecret: process.env.PG_CREDENTIALS_SECRET || '',
    frontEndUrl: process.env.FRONTEND_URL,
    awsRegion: process.env.REGION || 'us-east-1',
    awsCognitoUserPool: process.env.USER_POOL || ''
};
