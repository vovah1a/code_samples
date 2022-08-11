import TTransformer from '../interfaces/transformer.type';
import replaceFile from '../tools/replace-file.tool';
import Logger from '../logger';
import Format from '../format';

export default function StringFormat(transform: TTransformer): PropertyDecorator {
    return (target: object, propertyKey: string) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                const raw = Logger.globalGet(propertyKey as keyof Format<unknown, unknown>) ||
                    transform(this._data);

                const value = replaceFile(raw);

                if (value === undefined) {
                    return value;
                }

                return String(value)
            },
            set: (value) => value,
        });
    }
}

