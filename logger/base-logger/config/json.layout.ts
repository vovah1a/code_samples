import { ILog4JsLayout } from '../interfaces/log4js-layout.interface';
import LogLayoutsEnum from '../enums/log-layouts.enum';

const JSON_LAYOUT: ILog4JsLayout = {
    name: LogLayoutsEnum.JSON,
    config: () => logEvent => {
        return JSON.stringify(logEvent.data[0])
    }
};

export default JSON_LAYOUT;
