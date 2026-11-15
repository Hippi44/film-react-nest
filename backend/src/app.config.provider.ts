import { ConfigService } from '@nestjs/config';

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => {
    const driver = config
      .get<string>('DATABASE_DRIVER', 'memory')
      .trim()
      .toLowerCase();
    const port = Number(config.get('PORT', 3000));

    if (driver !== 'memory' && driver !== 'mongodb') {
      throw new Error('DATABASE_DRIVER must be either memory or mongodb');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid TCP port');
    }

    return {
      database: {
        driver,
        url: config.get<string>('DATABASE_URL', '').trim(),
      },
      port,
    };
  },
};

export interface AppConfig {
  database: AppConfigDatabase;
  port: number;
}

export interface AppConfigDatabase {
  driver: 'memory' | 'mongodb';
  url: string;
}
