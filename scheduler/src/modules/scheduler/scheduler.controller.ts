import { Body, Controller, Delete, Post } from '@nestjs/common';

import { CustomHttpException } from '../../../common/custom-http-exception';
import { SchedulerFactory } from './scheduler.factory';
import { SchedulerService } from './scheduler.service';

@Controller()
export class SchedulerController {
    constructor(
        private readonly schedulerFactory: SchedulerFactory,
        private readonly schedulerService: SchedulerService,
    ) {}

    @Post('create')
    public async startJob(@Body() body) {
        try {
            const schedulerService = await this.schedulerFactory.create(body.taskType);
            await schedulerService.createTask(body);
        } catch (e) {
            throw new CustomHttpException(e, e.message);
        }
    }

    @Delete('stop')
    public async cancelJob(@Body() body) {
        await this.schedulerService.cancelTask(body.taskType).catch(e => {
            throw new CustomHttpException(e, e.message);
        });
    }
}
