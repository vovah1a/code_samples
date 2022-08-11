import LogLevelsEnum from './enums/log-levels.enum';
import { ILogInternalRequest, ILogRequest } from './interfaces/log-request.interface';
import ILogRabbitmq from './interfaces/log-rabbitmq.interface';
import TLogDetails from './interfaces/log-details.type';
import LogTypesEnum from './enums/log-types.enum';

export default class LoggerData<SuccessLog, ErrorLog> {
    public level: LogLevelsEnum;
    public code: SuccessLog | ErrorLog;
    public request: ILogInternalRequest;
    public externalRequest: ILogRequest;
    public rabbitmq: ILogRabbitmq;
    public externalRabbitmq: ILogRabbitmq;
    public details: TLogDetails;
    public personalDetails: TLogDetails;
    public logTypes: LogTypesEnum[] = [LogTypesEnum.LOG_TYPE_O, LogTypesEnum.LOG_TYPE_T];
    public traceId: string;
    public userId: string;
    public message: string;
    public title: string;
    public stack: string;
    public isError: boolean;
}
