import { JwtPayload, decode } from 'jsonwebtoken';

// Tipo para o payload esperado no JWT. Você pode personalizar isso conforme suas necessidades.
interface CustomJwtPayload extends JwtPayload {
    sub: string;
    email_verified: boolean;
    iss: string;
    phone_number_verified: boolean;
    "cognito:username": string;
    origin_jti: string;
    aud: string;
    event_id: string;
    token_use: string;
    auth_time: number;
    phone_number: string;
    exp: number;
    iat: number;
    jti: string;
    email: string;
}

// Função para decodificar o JWT sem verificar a assinatura
async function decodeJwt(token: string): Promise<CustomJwtPayload | null> {
    try {
        // Decodifica o token usando jsonwebtoken
        const decoded = decode(token) as CustomJwtPayload;
        return decoded;
    } catch (error) {
        console.error('Erro ao decodificar o JWT:', error);
        return null;
    }
}

export default decodeJwt;