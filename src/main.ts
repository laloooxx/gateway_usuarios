import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Main-gateway');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: envs.host,
      port: envs.micro_port,
      retryAttempts: 2
    }
  })

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.startAllMicroservices();
  await app.listen(envs.port);
  logger.log(`Gateway is running on port: ${envs.port}`);
}
bootstrap();
