import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
//import { TodoModule } from './todo/todo.module'; // Falls vorhanden
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: join(__dirname, '..', '.env'),
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'sqlite',
                database: configService.get<string>('DB_DATABASE', 'data/app.db'),
                entities: [],
                autoLoadEntities: true,
                synchronize: true,
                logging: false,
            }),
        }),
        
        AuthModule,
        UserModule,

        // TodoModule,
    ],
})
export class AppModule {}