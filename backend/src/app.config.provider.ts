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

    if (driver !== 'memory' && driver !== 'postgres') {
      throw new Error('DATABASE_DRIVER must be either memory or postgres');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid TCP port');
    }

    const url = config.get<string>('DATABASE_URL', '').trim();
    const username = config.get<string>('DATABASE_USERNAME', '').trim();
    const password = config.get<string>('DATABASE_PASSWORD', '');

    if (driver === 'postgres' && (!url || !username)) {
      throw new Error(
        'DATABASE_URL and DATABASE_USERNAME are required when DATABASE_DRIVER=postgres',
      );
    }

    return {
      database: {
        driver,
        url,
        username,
        password,
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
  driver: 'memory' | 'postgres';
  url: string;
  username: string;
  password: string;
}
