import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'User already exists',
    path: ['email'],
  },
]);

export const CannotUpdateOrDeleteYourselfException = new ForbiddenException(
  'Error.CannotUpdateOrDeleteYourself',
);
