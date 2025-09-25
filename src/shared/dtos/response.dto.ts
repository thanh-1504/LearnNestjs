import { createZodDto } from 'nestjs-zod';
import { ResponseMessageSchema } from '../models/response.model';

export class ResponseMessageDto extends createZodDto(ResponseMessageSchema) {}
