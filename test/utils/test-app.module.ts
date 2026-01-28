import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// deine Module:
import { AuthModule } from '../../src/modules/auth/auth.module';
import { ArticleModule } from '../../src/modules/article/article.module';

@Module({
  imports: [
    // ✅ ConfigService verfügbar machen, aber OHNE .env zu lesen
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      // minimale Werte für alles, was bei dir via ConfigService.get(...) gebraucht wird
      load: [
        () => ({
          PORT: 3333,
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '3600s',
          // falls du andere Keys nutzt, kannst du sie hier ergänzen
          // z.B. REFRESH_SECRET, SWAGGER_TITLE, ...
        }),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    AuthModule,
    ArticleModule,
  ],
})
export class TestAppModule {}
