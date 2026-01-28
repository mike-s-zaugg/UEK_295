import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    // 2. Validierung
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // 3. Swagger Konfiguration
    const config = new DocumentBuilder()
        .setTitle('Todo API von Mike Zaugg')
        .setDescription('Ein API zur Verwaltung von Todo items')
        .setVersion('1.0.0')
        .setContact('Mike Zaugg', '', 'm.zaugg.inf24@stud.bbbaden.ch')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Port
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();