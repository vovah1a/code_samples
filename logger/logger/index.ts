import BaseLogger from '../base-logger/logger';
import * as config from 'config';
import { LogErrorCodesEnum, LogSuccessCodesEnum } from './enums/log-codes.enum';

const IS_LOCAL_LOGGER: boolean = config.get('app.is_local_logger');

export default class Logger extends BaseLogger<LogSuccessCodesEnum, LogErrorCodesEnum> {
    constructor() {
        super({ isLocal: IS_LOCAL_LOGGER });
    }
}
