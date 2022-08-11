import { Injectable } from '@nestjs/common';
import * as builder from 'xmlbuilder';

import { IData } from '../../interfaces/data.interface';

@Injectable()
export class GenerateXmlDataService {


    constructor() {}

    public async generateXmlData(
        data: IData,
    ): Promise<string> {

        const root = builder.create(
            'subject',
            {},
            {},
            {keepNullAttributes: true, keepNullNodes: true},
        );

        const body = root
            .ele('body')
            .ele('id', data.id)
            .up()
            .ele('name', data.name)
            .up();

        body.ele('creator', data.creator);

        const xml: string = root.end({ pretty: true });

        return xml;
    }

}
