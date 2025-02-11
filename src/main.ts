import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exeption-filters';
import { AppClusterService } from './cluster.service';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  Logger.log('SIGTERM received. Starting graceful shutdown...');
  // Implement graceful shutdown logic
});

async function bootstrap() {
  try {
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
        transform: true,
        whitelist: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({ origin: '*' });

    const port = process.env.PORT ?? 3333;
    await app.listen(port);

    Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
  } catch (error) {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Enable clustering in production
if (process.env.NODE_ENV === 'production') {
  AppClusterService.clusterize(bootstrap);
} else {
  bootstrap().catch((error) => {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  });
}
