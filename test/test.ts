import {CdkApigUtility} from '../src';

describe('CdkApigUtility', () => {
    it('convertFromDir', async () => {
        const results = new CdkApigUtility().convertFromDir('example');
        results.forEach(res => {
            console.log(res.modelName);
            console.dir(res, {depth: 10});
            console.log();
        })
    }).timeout(5000);
    it('convertFromFiles', async () => {
        const results = new CdkApigUtility().convertFromFiles(['example/sample-if.ts', 'example/sub/sub-if.ts',
            'example/sample-class.ts']);
        results.forEach(res => {
            console.log(res.modelName);
            console.dir(res, {depth: 10});
            console.log();
        })
    }).timeout(5000);
});
