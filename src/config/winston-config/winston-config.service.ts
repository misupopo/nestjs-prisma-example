import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import {
  WinstonModuleOptionsFactory,
  WinstonModuleOptions,
} from 'nest-winston';
import { logLevel } from 'config';
import { LogLevel } from '@shared/enums/log-level';

const { json, timestamp, combine, colorize, printf, simple } = winston.format;

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  createWinstonModuleOptions(): WinstonModuleOptions {
    const { NODE_ENV } = process.env;
    const transports: any[] = [];

    console.log(`NODE_ENV: ${NODE_ENV}`);

    if (NODE_ENV === 'development') {
      transports.push(new winston.transports.Console({level: LogLevel[logLevel]}));
    } else {
      [LogLevel.Error, LogLevel.Warn, LogLevel.Info, LogLevel.Debug].forEach((item) => {
        transports.push(
          new winston.transports.DailyRotateFile({
            level: item,
            maxSize: '5m',
            maxFiles: '14d',
            zippedArchive: true,
            datePattern: 'YYYY-MM-DD',
            filename: `log/api-${item}-%DATE%.log`,
          }),
        );
      });
    }
    return {
      transports: transports,
      format: combine(
        timestamp(),
        colorize(),
        json(),
        simple(),
        printf(info => {
          return Object.keys(info).reverse().reduce((acc, key, i) => {
            if (typeof key === 'string') {
              if (i > 0) acc += ", "
              acc += `"${key}": "${info[key]}"`
            }

            return acc;
          }, '{ ') + ' }';
        })
      ),
      defaultMeta: {
        appName: 'nestjs-starter',
      },
    };
  }
}
