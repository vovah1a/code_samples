import { Module } from '@nestjs/common';
import { appImports } from './app.module';
import { SchedulerModule } from './modules/_administration/scheduler/scheduler.module';

@Module({
    imports: [
        ...appImports,
        SchedulerModule,
    ]
})
export class SchedulerBootstrapModule {}