import { Injectable, Logger } from '@nestjs/common';
import { DeleteFilesScheduler } from './services/deleteFiles.scheduler';
import { LoggerService } from '../../_shared/logger/services/logger.service';
import { LogErrorCodesEnum } from '../../_shared/logger/enums/log-codes.enum';

@Injectable()
export class TasksService {
    private readonly logger = this.loggerService.create();

    constructor(
        private readonly deleteFilesScheduler: DeleteFilesScheduler,
        private readonly loggerService: LoggerService,
    ) {}

    public start() {
        const services = [
            this.deleteFilesScheduler,
        ];

        services.forEach(service => {
            service.start().catch(e => {
                this.logger
                    .sub()
                    .setError(e)
                    .errorLog('Необработанная ошибка', LogErrorCodesEnum.UNHANDLED_EXCEPTION);
                Logger.error(e);
            });
        });
    }
}
