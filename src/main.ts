import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exeption-filters';
import { AppClusterService } from './cluster.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NEXT_PUBLIC_SITE_ENV === 'dev'
        ? ['error', 'warn', 'debug', 'verbose']
        : ['error', 'warn'],
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: '*' });

  await app.listen(process.env.PORT ?? 3333);

  Logger.warn(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3333}/${globalPrefix}`,
  );
}

if (process.env.NODE_ENV === 'production') {
  AppClusterService.clusterize(bootstrap);
} else {
  bootstrap().catch((error) => {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  });
}
