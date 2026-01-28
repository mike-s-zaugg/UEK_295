export class PayloadDto {
    sub: number;
    username: string;
    isAdmin: boolean;
    iat?: number;
    exp?: number;
}