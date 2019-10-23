import {CdkApigUtility} from '../src';
import {HttpIntegration, ModelOptions, RestApi} from '@aws-cdk/aws-apigateway';
import {App} from '@aws-cdk/core';
import {SampleApigStack} from '../example/sample-apig-stack';

describe('CdkApigUtility', () => {
    it('convertFromDir', () => {
        const results = new CdkApigUtility().convertFromDir('example/dto');
        results.forEach(res => {
            console.log(res.modelName);
            console.dir(res, {depth: 10});
            console.log();
        })
    }).timeout(5000);
    it('convertFromFiles', () => {
        const results = new CdkApigUtility().convertFromFiles([
            'example/dto/sample-if.ts',
            'example/dto/sub/sub-if.ts',
            'example/dto/sample-class.ts']);
        results.forEach(res => {
            console.log(res.modelName);
            console.dir(res, {depth: 10});
            console.log();
        })
    }).timeout(5000);
    it('create cf template', () => {
        const app = new App({outdir: 'cdk.out'});
        const stack = new SampleApigStack(app, 'SampleApigStack');
        const api = new RestApi(stack, `TestApi`);
        const modelOptions: ModelOptions[] = new CdkApigUtility().convertFromDir('example/dto');
        const sampleClass = modelOptions.find(modelOption => modelOption.modelName === 'SampleClass') as ModelOptions;
        api.addModel(`SampleClassModel`, sampleClass);

        api.root.addMethod('GET', new HttpIntegration('http://sample.com'));
        app.synth();
    });
});
