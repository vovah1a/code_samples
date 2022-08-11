import LogTypesEnum from '../enums/log-types.enum';

export const LOGTYPES_KEY = 'LOGTYPES_KEY'

export default function Access(logtypes: LogTypesEnum[]): PropertyDecorator {
    return (target: object, propertyKey: string) => {
        Reflect.defineMetadata(`${LOGTYPES_KEY}${propertyKey}`, logtypes, target.constructor);
    }
}

