import TTransformer from '../interfaces/transformer.type';
import Logger from '../logger';
import Format from '../format';

export default function NumberFormat(transform: TTransformer): PropertyDecorator {
    return (target: object, propertyKey: string) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                const raw = Logger.globalGet(propertyKey as keyof Format<unknown, unknown>) ||
                    transform(this._data);

                const num = Number(raw);

                if (isNaN(num)) {
                    return undefined;
                }

                return num;
            },
            set: (value) => value,
        });
    }
}

