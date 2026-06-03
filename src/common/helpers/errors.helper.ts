import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

export const isUuidException = (id: string): void => {
  if (!isUUID(id))
    throw new BadRequestException(`Id (${id}) is not a valid UUID`);
};

export const handleDBException = (
  loggerName: string = 'Logger',
  error: any,
): never => {
  // handleMySQLException(loggerName, error);
  handlePostgreSQLException(loggerName, error);

  new Logger(loggerName).error(error);
  throw new InternalServerErrorException('Internal server error');
};

const handlePostgreSQLException = (loggerName: string, error: any): void => {
  // 23505: unique constraint violation
  if (error.code === '23505') {
    new Logger(loggerName).error(error);
    throw new BadRequestException(error.detail.replace('Key ', ''));
  }

  // 23503: foreign key constraint violation
  if (error.code === '23503') {
    new Logger(loggerName).error(error);
    throw new NotFoundException(
      error.detail.replace('Key ', '').replace('table ', ''),
    );
  }
};

const handleMySQLException = (loggerName: string, error: any): void => {
  // ER_DUP_ENTRY: unique constraint violation
  if (error.code === 'ER_DUP_ENTRY') {
    new Logger(loggerName).error(error);
    throw new BadRequestException(error.sqlMessage);
  }
};
