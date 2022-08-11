import { Configuration } from 'log4js';
import LogCategoriesEnum from '../enums/log-categories.enum';
import LogAppendersEnum from '../enums/log-appenders.enum';
import LogLayoutsEnum from '../enums/log-layouts.enum';

const LOG4JS_CONFIGURE: Configuration = {
    appenders: {
        [LogAppendersEnum.JSON_STDOUT]: {
            type: 'stdout',
            layout: {
                type: LogLayoutsEnum.JSON,
            }
        },
        default: {
            type: 'stdout',
        },
    },
    categories: {
        default: {
            appenders: ['default'],
            level: 'debug',
        },
        [LogCategoriesEnum.MAIN]: {
            appenders: [LogAppendersEnum.JSON_STDOUT],
            level: 'debug',
        },
    },
};

export default LOG4JS_CONFIGURE;
