import {CdkApigUtility} from '../src';
import {CfnDocumentationPart, LambdaIntegration, ModelOptions, RestApi} from '@aws-cdk/aws-apigateway';
import {App, Fn} from '@aws-cdk/core';
import {SampleApigStack} from '../example/sample-apig-stack';
import {Function} from '@aws-cdk/aws-lambda';

describe('CdkApigUtility', () => {
    it('getRequestQueryStringParams', () => {
        let result = new CdkApigUtility().getRequestQueryStringParams('example/dao/sample-dao.ts', 'getSomething1');
        console.log(result);
        result = new CdkApigUtility().getRequestQueryStringParams('example/dao/sample-dao.ts', 'getSomething2');
        console.log(result);
    }).timeout(5000);
    it('getArgumentDescriptions', () => {
        let result = new CdkApigUtility().getArgumentDescriptions('example/dao/sample-dao.ts', 'getSomething1');
        console.log(result);
        result = new CdkApigUtility().getArgumentDescriptions('example/dao/sample-dao.ts', 'getSomething2');
        console.log(result);
    }).timeout(5000);
    it('getModelsFromDir', () => {
        const results = new CdkApigUtility().getModelsFromDir('example/dto');
        results.forEach(res => {
            console.log(res.modelName);
            console.dir(res, {depth: 10});
            console.log();
        })
    }).timeout(5000);
    it('getModelsFromFiles', () => {
        const results = new CdkApigUtility().getModelsFromFiles([
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
        const v1 = api.root.addResource('v1');

        // Create responseModel
        const modelOptions: ModelOptions[] = new CdkApigUtility().getModelsFromDir('example/dto');
        const sampleClass = modelOptions.find(modelOption => modelOption.modelName === 'SampleClass') as ModelOptions;
        const responseModel = api.addModel(`SampleClassModel`, sampleClass);

        // Create request parameters
        const queryStringParams = new CdkApigUtility().getRequestQueryStringParams('example/dao/sample-dao.ts', 'getSomething1');

        // Create method using above objects.
        const lambda = Function.fromFunctionArn(stack, `someId`, Fn.importValue(`someValue`));
        v1.addMethod('GET', new LambdaIntegration(lambda), {
            requestParameters: queryStringParams,
            // If this method has body request params, you can also use requestModel which has the same structhre with responseModel.
            // requestModels: {
            //     'application/json': requestModel
            // },
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Content-Type': true,
                        'method.response.header.Access-Control-Allow-Origin': true,
                        'method.response.header.Access-Control-Allow-Credentials': true
                    },
                    responseModels: {
                        'application/json': responseModel
                    }
                }
            ]
        });

        // Create documentation as for the requestParameters
        const descriptions = new CdkApigUtility().getArgumentDescriptions('example/dao/sample-dao.ts', 'getSomething1');
        descriptions.forEach(description => {
            new CfnDocumentationPart(stack, `DocumentationPart${v1.path}-${description.name}`, {
                restApiId: api.restApiId,
                location: {method: 'GET', name: description.name, path: v1.path, type: 'QUERY_PARAMETER'},
                properties: JSON.stringify({description: description.description})
            });
        });
        app.synth();
    });
});

