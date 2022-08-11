import { NestFactory } from '@nestjs/core';
import * as config from 'config';
import { TasksService } from './modules/_administration/scheduler/tasks.service';
import { SchedulerBootstrapModule } from './scheduler.module';
import './prototypes/typeorm/QueryExpressionMap.createAlias';
import './common/error-handler';

const SCHEDULER_PORT: number = config.get('scheduler.port');

async function bootstrap() {
    const app = await NestFactory.create(SchedulerBootstrapModule);

    const tasksService = await app.get(TasksService);
    tasksService.start();

    app.listen(SCHEDULER_PORT);
}
bootstrap();
