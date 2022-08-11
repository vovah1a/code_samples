import LoggerData from './logger.data';
import LogTypesEnum from './enums/log-types.enum';
import { LOGTYPES_KEY } from './decorators/access.decorator';
import Format from './format';

class LoggerFormatter<SuccessLog, ErrorLog> extends Format<SuccessLog, ErrorLog> {
    constructor(data: LoggerData<SuccessLog, ErrorLog>) {
        super(data)
    }

    public format(logtype: LogTypesEnum): Format<SuccessLog, ErrorLog> {
        // @ts-ignore
        const parent = this.__proto__

        return Object.getOwnPropertyNames(Object.getPrototypeOf(parent))
            .reduce((acc, key) => {
                const metadata = Reflect.getMetadata(`${LOGTYPES_KEY}${key}`, this.constructor);
                const isAccess = !metadata || metadata.includes(logtype)

                if (key === 'constructor' || key[0] === '_' || !isAccess) {
                    return acc;
                }

                return {
                    ...acc,
                    [key]: this[key],
                }
            }, {}) as Format<SuccessLog, ErrorLog>;
    }
}

export default LoggerFormatter;
