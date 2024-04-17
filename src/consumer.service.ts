import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
// 不是很確定ConfirmChannel與Channel的差異，以及有無需要確認?
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor() {
    const connection = amqp.connect(['amqp://localhost:5672']);
    // 建立與rabbitmq連線時就建立這些queue
    this.channelWrapper = connection.createChannel({
      setup: (channel: ConfirmChannel) => {
        channel.assertQueue('emailQueuex', { durable: true });
        channel.assertQueue('emailQueuex2', { durable: true });
      },
    });
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.consume('emailQueuex', async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            this.logger.log(`111111111111-------Received message: ${content}`);
            // await this.emailService.sendEmail(content);
            // 看起來是清掉在gui上面的量
            channel.ack(message);
          }
        });
        // await channel.assertQueue('emailQueuex2', { durable: true });
        await channel.consume('emailQueuex2', async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            this.logger.log(
              `22222222222222-------Received message: ${content}`,
            );
            // await this.emailService.sendEmail(content);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
