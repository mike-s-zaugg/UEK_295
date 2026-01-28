// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './modules/article/article.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

/**
 * AppModule is the root module of the application.
 * It is responsible for importing and configuring other modules.
 *
 * The module includes:
 *
 * - `ConfigModule`: Provides configuration settings from environment variables and makes them globally available.
 * - `TypeOrmModule`: Configures and initializes the database connection with SQLite, supporting automatic loading of entities and schema synchronization.
 *   Note: Synchronization is recommended for development purposes only; migrations should be used in production environments.
 * - `AuthModule`: Module handling authentication and related functionalities.
 * - `ArticleModule`: Module managing articles and related operations.
 */
@Module({
  imports: [
    // wichtig, wenn wir .env verwenden
    ConfigModule.forRoot({
      isGlobal: true, // wichtig, damit überall verfügbar
    }),
    // datenbank initialisieren. Wir verwenden sqlite
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      synchronize: true, // !! Wichtig: Nur für Entwicklungszwecke aktivieren, in Produktion wird das nicht empfohlen. Hier sollte man mit Migrations arbeiten
      type: 'sqlite',
      database: process.env.DB_NAME || 'todo/myApp.db',
    }),
    AuthModule,
    ArticleModule,
  ],
})
export class AppModule {}
