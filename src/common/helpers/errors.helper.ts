import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export const handleDBException = (
  loggerName: string = 'Logger',
  error: any,
): never => {
  // MariaDB or MySQL
  if (error.code === 'ER_DUP_ENTRY') {
    throw new BadRequestException(error.sqlMessage);
  }

  // PostgresSQL
  if (error.code === '23505') {
    throw new BadRequestException(error.detail);
  }

  // console.log(error);
  new Logger(loggerName).error(error);
  throw new InternalServerErrorException('Internal server error');
};
