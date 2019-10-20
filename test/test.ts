import {CdkApigUtility} from '../src';

describe('CdkApigUtility', () => {
    it('convert', async () => {
        const results = new CdkApigUtility().convert(['./example/sample-request.ts', './example/sub-request.ts']);
        results.forEach(res => {
            console.log(res);
            console.log(res.schema.properties);
        })
    }).timeout(5000);
});
