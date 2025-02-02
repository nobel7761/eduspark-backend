import cluster from 'cluster';
import * as os from 'os';
import { Injectable, Logger } from '@nestjs/common';

const numCPUs = os.cpus().length;
const logger = new Logger('AppClusterService');

@Injectable()
export class AppClusterService {
  static clusterize(callback: () => void | Promise<void>): void {
    if (cluster.isPrimary) {
      logger.log(`Master server started on ${process.pid}`);

      // Fork workers
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      // Handle worker crashes and restart them
      cluster.on('exit', (worker, code, signal) => {
        logger.warn(
          `Worker ${worker.process.pid} died. Signal: ${signal}. Code: ${code}`,
        );
        logger.log('Starting a new worker...');
        cluster.fork();
      });

      // Log when a worker comes online
      cluster.on('online', (worker) => {
        logger.log(`Worker ${worker.process.pid} is online`);
      });

      // Graceful shutdown handling
      process.on('SIGTERM', () => {
        logger.log('SIGTERM received. Performing graceful shutdown...');

        // Notify workers to stop accepting new connections
        Object.values(cluster.workers || {}).forEach((worker) => {
          worker?.send('shutdown');
        });

        // Wait for workers to finish and then exit
        let workersAlive = Object.values(cluster.workers || {}).length;
        cluster.on('exit', () => {
          workersAlive--;
          if (workersAlive === 0) {
            logger.log('All workers stopped. Shutting down master...');
            process.exit(0);
          }
        });
      });

      // Periodic health checks
      setInterval(() => {
        for (const id in cluster.workers) {
          const worker = cluster.workers[id];
          worker?.send('health_check');
        }
      }, 30000);
    } else {
      logger.log(`Cluster server started on ${process.pid}`);

      // Handle shutdown signal from master
      process.on('message', (msg) => {
        if (msg === 'shutdown') {
          logger.log(`Worker ${process.pid} shutting down...`);
          // Close server and existing connections
          process.exit(0);
        }

        if (msg === 'health_check' && process.send) {
          process.send({ status: 'healthy', pid: process.pid });
        }
      });

      // Handle uncaught errors in worker
      process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception in worker ${process.pid}:`, error);
        process.exit(1);
      });

      void Promise.resolve(callback()).catch((err) => {
        logger.error('Worker error:', err);
        process.exit(1);
      });
    }
  }
}
