import TTransformer from '../interfaces/transformer.type';
import replaceFile from '../tools/replace-file.tool';
import Logger from '../logger';
import Format from '../format';

export default function ObjectFormat(transform: TTransformer): PropertyDecorator {
    return (target: object, propertyKey: string) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                const raw = Logger.globalGet(propertyKey as keyof Format<unknown, unknown>) ||
                    transform(this._data);

                const value = replaceFile(raw)

                if (value === undefined) {
                    return value;
                }

                if (typeof value !== 'object') {
                    return {
                        root: value,
                    }
                }

                if (!Object.keys(value).length) {
                    return undefined;
                }

                return value;
            },
            set: (value) => value,
        });
    }
}

