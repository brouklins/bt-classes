export class CustomError extends Error {
    requestDateTime: Date;

    constructor(public statusCode: number, message: string, errorName: string) {
        super(message);
        this.name = errorName;
        this.requestDateTime = new Date();
    }
}