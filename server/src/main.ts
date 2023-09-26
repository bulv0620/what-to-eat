import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('what-to-eat')
    .setDescription('what-to-eat')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
