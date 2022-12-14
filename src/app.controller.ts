import { PrismaService } from './prisma/prisma.service';
import { Controller, Get, Body, Inject, Param, Request, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Food } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // 正規表現を使ったパターンに該当する前に実行される
  @Get('REG_TEST')
  beforeRegexTest(): Object {
    return {
      path: 'REG_TEST',
      message: 'not regex',
    };
  }

  @Get('REG_TEST/test')
  beforeNestedRegexTest(): Object {
    return {
      path: 'REG_TEST/test',
      message: 'not nested regex',
    };
  }

  // nest-router を使う場合はこれを通すのは難しいので @Req を使った方が良さそう
  @Get('REG_*/*')
  nestedRegexTest(): Object {
    return {
      path: 'REG_*/*',
      message: 'nested regex',
    };
  }

  // 正規表現を使ったパスマッピング
  @Get('REG_*')
  regexTest(
    @Req() req: Request,
  ): Object {
    const path = req.url.split(/\//);
    console.log(path);

    return {
      path: 'REG_*',
    };
  }

  @Get('show/config')
  showConfig(): string {
    return this.appService.showConfig();
  }

  // 変数の共通かはできないみたい
  @Get('global/variable/set')
  async globalVariableTest(): Promise<any> {
    return await this.appService.globalVariableSet();
  }

  @Get('global/variable/export')
  async test(): Promise<any> {
    const result = await this.appService.globalVariableExport();
    console.log(`result: ${result}`)
    return {
      result: 'success',
      path: 'global/variable/export',
    };
  }

  @Get('rabbitmq/receive')
  async receive(): Promise<any> {
    console.log('start rabbitmq');
    await this.appService.rabbitMQReceive();
  }

  // todo makefile curl のオプションで -d からじゃないと動かないので後で hoppschotch からパラメーターを付与する方法を調査する
  @Get('rabbitmq/receive/wait')
  async receiveWait(
    @Body('wait_queue_name') waitQueueName: string,
    @Body('sequence_id') sequenceId: string,
  ): Promise<any> {
    console.log(`receive rabbitmq wait: ${waitQueueName}`);
    await this.appService.rabbitMQReceiveWait(waitQueueName, sequenceId);
    return { sequenceId }
  }

  @Get('rabbitmq/send')
  async send(
    @Body('destination_queue_name') destinationQueueName: string,
    @Body('message') message: string,
  ): Promise<any> {
    console.log(`send rabbitmq: ${destinationQueueName}`);
    await this.appService.rabbitMQReceiveSend(destinationQueueName, message);
  }

  @Get('foods')
  getFoods(): Promise<Food[]> {
    return this.prismaService.food.findMany();
  }

  // こういうあいまいな mapping の仕方は最後に持っていかないといけない
  @Get(':arg1/:arg2')
  pathMappingTest(
    @Param('arg1') arg1: string,
    @Param('arg2') arg2: string,
  ): Object {
    return {
      arg1: arg1,
      arg2: arg2,
      path: ':arg1/:arg2',
    };
  }

  @Get()
  getHello(): string {
    this.logger.warn('this is warn level');
    this.logger.debug('this is debug level');
    this.logger.info('this is info level');
    this.logger.error('this is error level');
    console.log('this is console.log');
    return this.appService.getHello();
  }
}
