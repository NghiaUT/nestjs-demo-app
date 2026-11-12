import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategy';
import configuration from '../config/configuration.js';

export default new DataSource({
  type: 'postgres',
  host: configuration().database.host,
  port: configuration().database.port,
  username: configuration().database.user,
  password: configuration().database.password,
  database: configuration().database.name,
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
