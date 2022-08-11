import * as log4js from 'log4js';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

import LogLevelsEnum from './enums/log-levels.enum';
import LogTypesEnum from './enums/log-types.enum';
import LogCategoriesEnum from './enums/log-categories.enum';
import TLogDetails from './interfaces/log-details.type';
import ILogRabbitmq from './interfaces/log-rabbitmq.interface';
import { ILogInternalRequest, ILogRequest } from './interfaces/log-request.interface';
import ILoggerOptions from './interfaces/logger-options.interface';
import LOG4JS_CONFIGURE from './config/config';
import JSON_LAYOUT from './config/json.layout';
import LoggerData from './logger.data';
import LoggerFormatter from './logger.formatter';
import asyncStorage from './async-storage';
import Format from './format';

export default class BaseLogger<SuccessLog, ErrorLog> {
    protected loggerData: LoggerData<SuccessLog, ErrorLog>;

    constructor(private readonly options?: ILoggerOptions) {
        log4js.configure(LOG4JS_CONFIGURE);
        log4js.addLayout(JSON_LAYOUT.name, JSON_LAYOUT.config);

        this.loggerData = new LoggerData()
        this.loggerData.traceId = uuidv4();
    }

    /** Создание Logger с собственной областью видимости */
    public sub(): BaseLogger<SuccessLog, ErrorLog> {
        const subLogger = new BaseLogger<SuccessLog, ErrorLog>(this.options);
        subLogger.loggerData = { ...this.loggerData }
        subLogger.loggerData.traceId = uuidv4();

        return subLogger;
    }

    /** Сохранение параметров логера одним методом */
    public assign(data: Partial<LoggerData<SuccessLog, ErrorLog>>): BaseLogger<SuccessLog, ErrorLog> {
        Object.assign(this.loggerData, data);

        return this;
    }

    /**
     * Задание типов лога: logtypeO, logtypeB, logtypeC, logtypeT, logtypeA.
     * По умолчанию logtypeO, logtypeT
     */
    public setTypes(types: LogTypesEnum[]): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.logTypes = types;

        return this;
    }

    /** Добавление нового типа лога к уже ранее заданным типам */
    public addTypes(types: LogTypesEnum[]): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.logTypes = [...this.loggerData.logTypes, ...types];

        return this;
    }

    /** Задание сообщения лога (data.o_message) */
    public setMessage(message: string): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.message = message;

        return this;
    }

    /** Задание ошибки (data.o_message = error.message, data.d_stack = error.stack) */
    public setError(error: Error): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.message = error.message;
        this.loggerData.stack = error.stack;
        this.loggerData.isError = true;

        return this;
    }

    /**
     * Задание деталей лога.
     * Важно! Нельзя передавать персональные данные.
     */
    public setDetails(details: TLogDetails): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.details = details;

        return this;
    }

    /** Добавление деталей лога к уже ранее заданным.
     * Важно! Нельзя передавать персональные данные
     */
    public addDetails(details: TLogDetails): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.details = {
            ...this.loggerData.details,
            ...details,
        };

        return this;
    }

    /** Задание персональных деталей */
    public setPersonalDetails(details: TLogDetails): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.personalDetails = details;

        return this;
    }

    /** Добавление персональных деталей лога к уже ранее заданным */
    public addPersonalDetails(details: TLogDetails): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.personalDetails = {
            ...this.loggerData.personalDetails,
            ...details,
        };

        return this;
    }

    /** Добавление данных входящего запроса */
    public setRequest(data: ILogInternalRequest): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.request = data;

        return this;
    }

    /** Добавление данных входящего запроса к уже ранее заданным данным */
    public addRequest(data: ILogInternalRequest): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.request = {
            ...this.loggerData.request,
            ...data,
        };

        return this;
    }

    /** Добавление данных исходящего запроса */
    public setExternalRequest(data: ILogRequest): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.externalRequest = data;

        return this;
    }

    /** Добавление данных исходящего запроса к уже ранее заданным данным */
    public addExternalRequest(data: ILogRequest): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.externalRequest = {
            ...this.loggerData.externalRequest,
            ...data,
        };

        return this;
    }

    /** Добавление данных исходящего RabbitMQ-сообщения */
    public setExternalRabbitMq(data: ILogRabbitmq): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.externalRabbitmq = data;

        return this;
    }

    /** Добавление данных исходящего RabbitMQ-сообщения к уже ранее заданным данным */
    public addExternalRabbitMq(data: ILogRabbitmq): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.externalRabbitmq = {
            ...this.loggerData.externalRabbitmq,
            ...data,
        };

        return this;
    }

    /** Добавление данных входящего RabbitMQ-сообщения */
    public setRabbitMq(data: ILogRabbitmq): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.rabbitmq = data;

        return this;
    }

    /** Добавление данных входящего RabbitMQ-сообщения к уже ранее заданным данным */
    public addRabbitMq(data: ILogRabbitmq): BaseLogger<SuccessLog, ErrorLog> {
        this.loggerData.externalRabbitmq = {
            ...this.loggerData.rabbitmq,
            ...data,
        };

        return this;
    }

    public traceLog(title: string, code: SuccessLog): void {
        this.loggerData.level = LogLevelsEnum.TRACE;
        this.loggerData.title = title;
        this.loggerData.code = code;
        this.log();
    }

    public infoLog(title: string, code: SuccessLog): void {
        this.loggerData.level = LogLevelsEnum.INFO;
        this.loggerData.title = title;
        this.loggerData.code = code;
        this.log();
    }

    public errorLog(title: string, code: ErrorLog): void {
        this.loggerData.level = LogLevelsEnum.ERROR;
        this.loggerData.title = title;
        this.loggerData.code = code;
        this.log();
    }

    public fatalLog(title: string, code: ErrorLog): void {
        this.loggerData.level = LogLevelsEnum.FATAL;
        this.loggerData.title = title;
        this.loggerData.code = code;
        this.log();
    }

    public warnLog(title: string, code: ErrorLog): void {
        this.loggerData.level = LogLevelsEnum.WARN;
        this.loggerData.title = title;
        this.loggerData.code = code;
        this.log();
    }

    private log(): void {
        const formatter = new LoggerFormatter<SuccessLog, ErrorLog>(this.loggerData)
        const timestamp = moment().toDate()
        const logger = log4js.getLogger(LogCategoriesEnum.MAIN);

        if (this.options?.isLocal) {
            logger[this.loggerData.level]({
                timestamp,
                logtype: LogTypesEnum.LOG_TYPE_O,
                data: formatter.format(LogTypesEnum.LOG_TYPE_O),
            });

            return;
        }

        this.loggerData.logTypes.forEach(item => {
            logger[this.loggerData.level]({
                timestamp,
                logtype: item,
                data: formatter.format(item),
            });
        });
    }

    static globalGet<T>(key: keyof Format<unknown, unknown>): T {
        return asyncStorage.get<T>(key)
    }

    static globalSet(key: keyof Format<unknown, unknown>, value: unknown): void {
        asyncStorage.set(key, value)
    }

    static globalRun(cb: (...args: unknown[]) => unknown): void {
        asyncStorage.storage().run(new Map<string, string>(), cb)
    }
}
