[![npm version](https://badge.fury.io/js/cdk-apig-utility.svg)](https://badge.fury.io/js/cdk-apig-utility)
[![Build Status](https://travis-ci.org/A-Kurimoto/cdk-apig-utility.svg?branch=master)](https://travis-ci.org/A-Kurimoto/cdk-apig-utility)
[![Coverage Status](https://coveralls.io/repos/github/A-Kurimoto/cdk-apig-utility/badge.svg?branch=master)](https://coveralls.io/github/A-Kurimoto/cdk-apig-utility?branch=master)

cdk-apig-utility
====

Have you ever wished that Swagger could be automatically generated from JSDoc?

It auto-generates useful CDK’s objects from TypeScript entity(and its JSDoc) to define swagger easily at API Gateway.

# Requirement
- @aws-cdk/aws-apigateway@1.14.0
- typescript

# Install

```bash
$ npm install cdk-apig-utility
```

# Usage

At first, please understand the following CDK's document.

- [Working with models](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-apigateway-readme.html#working-with-models)

Following is the example of CDK.

```typescript
// We define the JSON Schema for the transformed valid response
const responseModel = api.addModel('ResponseModel', {
  contentType: 'application/json',
  modelName: 'ResponseModel',
  schema: { '$schema': 'http://json-schema.org/draft-04/schema#', 'title': 'pollResponse', 'type': 'object', 'properties': { 'state': { 'type': 'string' }, 'greeting': { 'type': 'string' } } }
});
```

```typescript
const integration = new LambdaIntegration(hello, {
  proxy: false,
  requestParameters: {
    // You can define mapping parameters from your method to your integration
    // - Destination parameters (the key) are the integration parameters (used in mappings)
    // - Source parameters (the value) are the source request parameters or expressions
    // @see: https://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html
    'integration.request.querystring.who': 'method.request.querystring.who'
  },
  ...
```

Perhaps you were in pain when you had to write the same contents of the entity in the generation of models and request parameters.

Moreover, you must create the [CfnDocumentationPart](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-apigateway.CfnDocumentationPart.html) object so as to write the description of request parameters.

You can auto-generate the above objects from following examples.

## Model

### Example

Model can be generated from entity objects.

```typescript:sample-if.ts
import {SubIf} from './sub/sub-if';

export interface SampleIf {
    /**
     * @desc JSDoc of param1
     */
    param1: string;
    /**
     * @description JSDoc of param2
     */
    param2: number;
    /**
     * ignored comment of param3
     */
    param3: boolean;
    param4: string[];
    param5: number[];
    param6: boolean[];
    param7: SubIf;
    param8: SubIf[];
}
```

```typescript:sub-if.ts
export interface SubIf {
    subParam1: string;
}
```

### Execution

```typescript
import {CdkApigUtility} from 'cdk-apig-utility';
import {ModelOptions} from '@aws-cdk/aws-apigateway';

// You can also use getResponseModelsFromDir method.
const modelOptions: ModelOptions[] = new CdkApigUtility().getResponseModelsFromFiles(['sample-if.ts', 'sub/sub-if.ts']);

// You can search the model what you want by 'modelName'(It has a class name or interface name). 
const targetModel = modelOptions.find(modelOption => modelOption.modelName === 'SampleIf') as ModelOptions;
```

### Result

```json
{
    "contentType": "application/json",
    "modelName": "SampleIf",
    "schema": {
        "schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "jsDoc of param1"},
            "param2": {"type": "number", "description": "jsDoc of param2"},
            "param3": {"type": "boolean", "description": "No description."},
            "param4": {
                "type": "array",
                "description": "No description.",
                "items": {"type": "string"}
            },
            "param5": {
                "type": "array",
                "description": "No description.",
                "items": {"type": "number"}
            },
            "param6": {
                "type": "array",
                "description": "No description.",
                "items": {"type": "boolean"}
            },
            "param7": {
                "type": "object",
                "description": "No description.",
                "properties": {"subParam1": {"type": "string", "description": "No description."}}
            },
            "param8": {
                "type": "array",
                "description": "No description.",
                "items": {
                    "type": "object",
                    "properties": {"subParam1": {"type": "string", "description": "No description."}}
                }
            }
        }
    }
}

```

If you have written the JSDoc's `@desc` or `@description` tag at the property, it can be converted to description.

## Request parameters

### Example

Request parameters can be generated from method's arguments.

```typescript:sample-dao.ts
    /**
     * This is sample method.
     *
     * @param limit
     * @param sort
     1：ascending
     2：descending
     * @param word some word
     * @param isSomeFlg some boolean value1¬
     * @param someArray some array
     */
    async getSomething1(limit: number, offset: number, sort: number, word?: string, isSomeFlg?: boolean,
                        someArray?: string[]): Promise<any> {

    }
```

### Execution

```typescript
const requestParameters = new CdkApigUtility().getRequestQueryStringParams('example/dao/sample-dao.ts', 'getSomething1');
```

### Result

```json
{ 
  "method.request.querystring.limit": true,
  "method.request.querystring.offset": true,
  "method.request.querystring.sort": true,
  "method.request.querystring.word": false,
  "method.request.querystring.isSomeFlg": false,
  "method.request.querystring.someArray": false
}
```

The values(true or false) can be generated from '?' of arguments.

## Request parameter's documents

Request parameters' documents can be generated from method's arguments and JSDoc.

```typescript:sample-dao.ts
    /**
     * This is sample method.
     *
     * @param limit
     * @param sort
     1：ascending
     2：descending
     * @param word some word
     * @param isSomeFlg some boolean value1¬
     * @param someArray some array
     */
    async getSomething1(limit: number, offset: number, sort: number, word?: string, isSomeFlg?: boolean,
                        someArray?: string[]): Promise<any> {

    }
```

### Execution

```typescript
const descriptions = new CdkApigUtility().getArgumentDescriptions('example/dao/sample-dao.ts', 'getSomething1');
```

### Result

```json
[
  { "name": "sort", "description": "1：ascending\n2：descending" },
  { "name": "word", "description": "some word" },
  { "name": "isSomeFlg", "description": "some boolean value1" },
  { "name": "someArray", "description": "some array" }
]
```

If you have written the JSDoc's `@param` tag at the method, it can be converted to description.

You can use this result when you create the [CfnDocumentationPart](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-apigateway.CfnDocumentationPart.html).

## How to use with CDK.

Please see the following test code.

[create cf template](https://github.com/A-Kurimoto/cdk-apig-utility/blob/master/test/test.ts)

You can use this model at both request and response.

# Licence

[MIT](https://github.com/A-Kurimoto/cdk-apig-utility/blob/master/LICENSE)

# Author

[A-Kurimoto](https://github.com/A-Kurimoto)
