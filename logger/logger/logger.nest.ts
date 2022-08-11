import { LoggerService } from '@nestjs/common';

import { LogErrorCodesEnum, LogSuccessCodesEnum } from './enums/log-codes.enum';
import Logger from '../logger';

export default class NestLogger implements LoggerService {
    private readonly logger = new Logger();

    public log(message: string): void {
        this.logger
            .setMessage(message)
            .infoLog('Информационное сообщение от Nest.js', LogSuccessCodesEnum.NEST_INFO_MESSAGE);
    }

    public error(message: string): void {
        this.logger
            .setError(new Error(message))
            .errorLog('Сообщение с ошибкой от Nest.js', LogErrorCodesEnum.ERROR_NEST_MESSAGE);
    }

    public warn(message: string): void {
        this.logger
            .setMessage(message)
            .warnLog('Предупреждающее сообщение от Nest.js', LogErrorCodesEnum.WARN_NEST_MESSAGE);
    }
}
