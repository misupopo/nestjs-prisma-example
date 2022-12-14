import { Injectable } from '@nestjs/common';
import { RabbitmqService } from "@shared/services/rabbitmq/rabbitmq.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async sendUserInfo(): Promise<Object> {
    const queueName = 'user-info';
    await this.rabbitmqService.sendToQueue(queueName, {id: 1,});

    return {
      name: 'Sending Queue',
      message: 'success send message',
    };
  }
}
