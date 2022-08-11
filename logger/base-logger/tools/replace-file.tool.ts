import * as FormData from 'form-data';
import { Stream } from 'stream';
import { Buffer } from 'buffer';

export default function replaceFile(value: unknown): unknown {
    if (value instanceof FormData) {
        return '<file>'
    }

    if (value instanceof Stream) {
        return '<stream>';
    }

    if (value instanceof Buffer) {
        return '<buffer>';
    }

    return value;
}
