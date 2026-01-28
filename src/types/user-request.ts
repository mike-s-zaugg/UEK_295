import { Request } from 'express';
import { ReturnUserDto } from '../user/dto/return-user.dto';

export interface UserRequest extends Request {
    user?: ReturnUserDto;
    correlationId?: number;
}