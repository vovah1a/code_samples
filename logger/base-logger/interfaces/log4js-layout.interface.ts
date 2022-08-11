import { LoggingEvent } from 'log4js';
import LoggerFormatter from '../logger.formatter';

interface ILogEvent extends Omit<LoggingEvent, 'data'> {
    data: [LoggerFormatter<unknown, unknown>]
}

export interface ILog4JsLayout {
    name: string;
    config: (cfg) => (logEvent: ILogEvent) => string;
}
