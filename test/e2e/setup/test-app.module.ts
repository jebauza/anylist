import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { JwtService } from '@nestjs/jwt';

import { AuthModule } from '../../../src/auth/auth.module';
import { UsersModule } from '../../../src/users/users.module';
import { ItemsModule } from '../../../src/items/items.module';
import { ListsModule } from '../../../src/lists/lists.module';
import { ItemListModule } from '../../../src/item-list/item-list.module';

export const TEST_SCHEMA = 'test';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: +(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME ?? 'anylist_db',
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD,
      schema: TEST_SCHEMA,
      ssl: false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async () => ({
        playground: false,
        autoSchemaFile: true,
        context({ req }: { req: Request }) {
          return { req };
        },
      }),
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    ListsModule,
    ItemListModule,
  ],
})
export class TestAppModule {}
