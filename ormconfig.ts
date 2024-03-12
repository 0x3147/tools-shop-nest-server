import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { DataBaseEnum } from './src/common/database'

import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

const getEnv = (env: string): Record<string, unknown> => {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env))
  }
  return {}
}

const buildConnectionOptions = () => {
  const defaultConfig = getEnv('.env')
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`)
  // configService
  const config = { ...defaultConfig, ...envConfig }

  return {
    type: config[DataBaseEnum.DB_TYPE],
    host: config[DataBaseEnum.DB_HOST],
    port: config[DataBaseEnum.DB_PORT],
    username: config[DataBaseEnum.DB_USERNAME],
    password: config[DataBaseEnum.DB_PASSWORD],
    database: config[DataBaseEnum.DB_DATABASE],
    // 同步本地的schema与数据库 -> 初始化的时候去使用
    synchronize: true,
    logging: false,
    entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    poolSize: 10,
    connectorPackage: 'mysql2'
  } as TypeOrmModuleOptions
}

export const connectionParams = buildConnectionOptions()
