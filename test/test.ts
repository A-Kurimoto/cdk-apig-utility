import {CdkApigUtility} from '../src';

describe('CdkApigUtility', () => {
    it('convertFromDir', async () => {
        const results = new CdkApigUtility().convertFromDir('example');
        results.forEach(res => {
            console.log(res);
            console.log(res.schema.properties);
        })
    }).timeout(5000);
    it('convertFromFiles', async () => {
        const results = new CdkApigUtility().convertFromFiles(['example/sample-if.ts', 'example/sub/sub-if.ts',
            'example/sample-class.ts']);
        results.forEach(res => {
            console.log(res);
            console.log(res.schema.properties);
        })
    }).timeout(5000);
});
const hoge = {
    contentType: 'application/json',
    modelName: 'SampleIf',
    schema: {
        schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {
            param1: {type: 'string', description: 'jsDoc of param1'},
            param2: {type: 'number', description: 'jsDoc of param2'},
            param3: {type: 'boolean', description: 'No description.'},
            param4: {
                type: 'array',
                description: 'No description.',
                items: {type: 'string'}
            },
            param5: {
                type: 'array',
                description: 'No description.',
                items: {type: 'number'}
            },
            param6: {
                type: 'array',
                description: 'No description.',
                items: {type: 'boolean'}
            },
            param7: {
                type: 'object',
                description: 'No description.',
                properties: {subParam1: {type: 'string', description: 'No description.'}}
            },
            param8: {
                type: 'array',
                description: 'No description.',
                items: {
                    type: 'object',
                    properties: {subParam1: {type: 'string', description: 'No description.'}}
                }
            }
        }

    }
}
