import {CdkApigUtility} from '../src';

describe('CdkApigUtility', () => {
    it('convertFromDir', async () => {
        const results = new CdkApigUtility().convertFromDir('example');
        results.forEach(res => {
            console.log(res);
            console.log(res.schema.properties);
        })
    }).timeout(5000);
    it.only('convertFromFiles', async () => {
        const results = new CdkApigUtility().convertFromFiles(['./example/sample-request.ts', './example/sub/sub-request.ts']);
        results.forEach(res => {
            console.log(res);
            console.log(res.schema.properties);
        })
    }).timeout(5000);
});
