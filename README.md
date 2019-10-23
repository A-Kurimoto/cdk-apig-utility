[![npm version](https://badge.fury.io/js/cdk-apig-utility.svg)](https://badge.fury.io/js/cdk-apig-utility)
[![Build Status](https://travis-ci.org/A-Kurimoto/cdk-apig-utility.svg?branch=master)](https://travis-ci.org/A-Kurimoto/cdk-apig-utility)
[![Coverage Status](https://coveralls.io/repos/github/A-Kurimoto/cdk-apig-utility/badge.svg?branch=master)](https://coveralls.io/github/A-Kurimoto/cdk-apig-utility?branch=master)

cdk-apig-utility
====

Have you ever wished that Swagger could be automatically generated from JSDoc?

It auto-generates useful CDK’s objects from TypeScript entity(and its JSDoc) to define swagger easily at API Gateway.

# Requirement
- @aws-cdk/aws-apigateway
- typescript

# Install

```bash
$ npm install cdk-apig-utility
```

# Usage

## Model

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

Perhaps you were in pain when you had to write the same contents of the entity in the generation of models.

You can auto-generate the above object from following example's entity.

### Entity's example
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

// You can also use convertFromDir method.
const modelOptions: ModelOptions[] = new CdkApigUtility().convertFromFiles(['sample-if.ts', 'sub/sub-if.ts']);

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

### How to use with CDK.

Please see the following test code.

[create cf template](https://github.com/A-Kurimoto/cdk-apig-utility/blob/master/test/test.ts)

## Licence

[MIT](https://github.com/A-Kurimoto/cdk-apig-utility/blob/master/LICENSE)

## Author

[A-Kurimoto](https://github.com/A-Kurimoto)
