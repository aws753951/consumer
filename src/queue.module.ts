import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service.js';

@Module({
  providers: [ConsumerService],
  exports: [],
})
export class QueueModule {}
