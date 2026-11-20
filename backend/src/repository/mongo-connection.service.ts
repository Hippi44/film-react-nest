import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import mongoose = require('mongoose');
import type { AppConfig } from '../app.config.provider';

@Injectable()
export class MongoConnectionService implements OnModuleDestroy {
  private readonly connection: Promise<mongoose.Connection | null>;

  constructor(@Inject('CONFIG') config: AppConfig) {
    if (config.database.driver === 'memory') {
      this.connection = Promise.resolve(null);
      return;
    }

    if (!config.database.url) {
      throw new Error('DATABASE_URL is required when DATABASE_DRIVER=mongodb');
    }

    this.connection = mongoose
      .createConnection(config.database.url, {
        serverSelectionTimeoutMS: 5000,
      })
      .asPromise();
  }

  async getConnection(): Promise<mongoose.Connection> {
    const connection = await this.connection;
    if (!connection) throw new Error('MongoDB connection is not configured');
    return connection;
  }

  async onModuleDestroy(): Promise<void> {
    const connection = await this.connection.catch(() => null);
    if (connection) await connection.close();
  }
}
