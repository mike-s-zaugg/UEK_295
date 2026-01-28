// src/main-swagger-export.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { globalPrefix, swaggerInfo, version } from '../src/informations';
import { AppModule } from '../src/app.module';

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_NAME = ':memory:';
process.env.JWT_SECRET = 'secret';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });

  // wichtig: global prefix
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle(swaggerInfo.title)
    .setDescription(swaggerInfo.description)
    .setContact(
      swaggerInfo.author.name,
      swaggerInfo.author.url,
      swaggerInfo.author.email,
    )
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('docs/openapi.json', JSON.stringify(document, null, 2));

  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
