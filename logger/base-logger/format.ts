/* tslint:disable:variable-name */

import StringFormat from './decorators/string.decorator';
import ObjectFormat from './decorators/object.decorator';
import NumberFormat from './decorators/number.decorator';
import LoggerData from './logger.data';
import LogTypesEnum from './enums/log-types.enum';
import Access from './decorators/access.decorator';

export default class Format<SuccessLog, ErrorLog> {
    constructor(
        private readonly _data: LoggerData<SuccessLog, ErrorLog>,
    ) {}

    @StringFormat(data => data.level)
    public readonly level: string;

    @StringFormat((data) => data.traceId)
    public readonly trace_id: string;

    // Детали
    @Access([LogTypesEnum.LOG_TYPE_O, LogTypesEnum.LOG_TYPE_T])
    @ObjectFormat((data) => data.isError ? data.details : undefined)
    public readonly d_error: string;

    @Access([LogTypesEnum.LOG_TYPE_O, LogTypesEnum.LOG_TYPE_T])
    @ObjectFormat((data) => !data.isError ? data.details : undefined)
    public readonly d_success: string;

    @Access([LogTypesEnum.LOG_TYPE_O, LogTypesEnum.LOG_TYPE_T])
    @StringFormat(data => data.stack)
    public readonly d_stack: string;

    // Детали с персональными данными
    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.isError ? data.personalDetails : undefined)
    public readonly d_p_error: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => !data.isError ? data.personalDetails : undefined)
    public readonly d_p_success: string;

    // Основные данные действия
    @StringFormat(data => data.title)
    public readonly o_title: string;

    @StringFormat((data) => data.message)
    public readonly o_message: string;

    @StringFormat((data) => data.code)
    public readonly o_code: string;

    // Данные пользователя
    @StringFormat((data) => data.userId)
    public readonly u_id: string;

    // Входящий HTTP-запрос
    @StringFormat((data) => data.request?.url)
    public readonly r_url: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.request?.response)
    public readonly r_res: object;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.request?.body)
    public readonly r_body: object;

    @ObjectFormat((data) => data.request?.query)
    public readonly r_query: object;

    @ObjectFormat((data) => data.request?.params)
    public readonly r_params: object;

    @StringFormat(data => data.request?.code)
    public readonly r_code: string;

    @StringFormat(data => data.request?.method)
    public readonly r_method: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.request?.headers)
    public readonly r_headers: object;

    @NumberFormat(data => data.request?.runtime)
    public readonly r_runtime: string;

    // Исходящий HTTP-запрос
    @StringFormat((data) => data.externalRequest?.url)
    public readonly er_url: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.externalRequest?.response)
    public readonly er_res: object;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.externalRequest?.body)
    public readonly er_body: object;

    @ObjectFormat((data) => data.externalRequest?.query)
    public readonly er_query: object;

    @ObjectFormat((data) => data.externalRequest?.params)
    public readonly er_params: object;

    @StringFormat(data => data.externalRequest?.code)
    public readonly er_code: string;

    @StringFormat(data => data.externalRequest?.method)
    public readonly er_method: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat((data) => data.externalRequest?.headers)
    public readonly er_headers: object;

    @NumberFormat(data => data.externalRequest?.runtime)
    public readonly er_runtime: string;

    // Исходящее сообщение из RabbitMQ
    @StringFormat(data => data.externalRabbitmq?.queue)
    public readonly ea_queue: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat(data => data.externalRabbitmq?.body)
    public readonly ea_body: object;

    @StringFormat(data => data.externalRabbitmq?.exchange)
    public readonly ea_exchange: string;

    @StringFormat(data => data.externalRabbitmq?.routingKey)
    public readonly ea_routing_key: string;

    @NumberFormat(data => data.externalRabbitmq?.runtime)
    public readonly ea_runtime: string;

    // Входящее сообщение из RabbitMQ
    @StringFormat(data => data.rabbitmq?.queue)
    public readonly a_queue: string;

    @Access([LogTypesEnum.LOG_TYPE_O])
    @ObjectFormat(data => data.rabbitmq?.body)
    public readonly a_body: object;

    @StringFormat(data => data.rabbitmq?.exchange)
    public readonly a_exchange: string;

    @NumberFormat(data => data.rabbitmq?.runtime)
    public readonly a_runtime: string;
}

