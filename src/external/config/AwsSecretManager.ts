import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import DbCredentialsModel from "../../models/DbCredentialsModel";
import { environment } from "./Environment";


export default class AwsSecretsManager {
    private readonly client: SecretsManagerClient;

    constructor() {
        this.client = new SecretsManagerClient({ region: environment.awsRegion });
    }

    async getSecret(secretName: string): Promise<string | null> {
        try {
            const response = await this.client.send(
                new GetSecretValueCommand({
                    SecretId: secretName,
                    VersionStage: "AWSCURRENT",
                })
            );

            return response.SecretString || null;
        } catch (error) {
            console.error("Error retrieving secret:", error);
            return null;
        }
    }

    async getDbCredentials(secretName: string): Promise<DbCredentialsModel | null> {
        try {

            const secretString = await this.getSecret(secretName);

            if (!secretString) {
                console.error("Secret string is empty.");
                return null;
            }

            const secretCredentials = JSON.parse(secretString);

            if (!secretCredentials.username || !secretCredentials.password) {
                console.error("Missing required credentials in secret string.");
                return null;
            }

            const credentials: DbCredentialsModel = {
                username: secretCredentials.username,
                password: secretCredentials.password
            };

            return credentials;

        } catch (error) {
            console.error("Error parsing secret:", error);
            return null;
        }
    }
}
