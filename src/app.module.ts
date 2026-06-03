import 'dotenv/config';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';
import { ListsModule } from './lists/lists.module';
import { ItemListModule } from './item-list/item-list.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      schema: process.env.DB_SCHEMA ?? 'public',

      ssl:
        process.env.DB_SSL !== undefined
          ? process.env.DB_SSL === 'true'
          : process.env.STAGE === 'prod',

      autoLoadEntities: true,
      synchronize: false,

      migrationsTableName: 'migrations',
      migrations: [join(__dirname, 'migrations/*{.js,.ts}')],
    }),

    // TODO: Configuracion basica
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   // debug: false,
    //   playground: false,
    //   plugins: [ApolloServerPluginLandingPageLocalDefault()],
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // }),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (jwtService: JwtService) => ({
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context({ req }) {
          // Schema blocking: a token is required to view the schema
          // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // const token = req.headers.authorization?.replace('Bearer ', '');
          // if (!token) throw Error('Token not found');
          // // const payload: JwtPayload = jwtService.decode(token);
          // // if (!payload) throw Error('Token not valid');
          // try {
          //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          //   jwtService.verify(token);
          // } catch (error) {
          //   const message =
          //     error instanceof Error ? error.message : 'is invalid';
          //   throw Error(`Token (${message})`);
          // }
        },
      }),
    }),

    ItemsModule,

    UsersModule,

    AuthModule,

    SeedModule,

    ListsModule,

    ItemListModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
