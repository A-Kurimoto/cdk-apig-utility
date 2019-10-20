import {JsonSchema, JsonSchemaType, JsonSchemaVersion, ModelOptions} from '@aws-cdk/aws-apigateway';
import * as fs from "fs";
import * as ts from "typescript";
import {ClassDeclaration, Identifier, InterfaceDeclaration, Node, ScriptTarget, SyntaxKind} from "typescript";


export class CdkApigUtility {

    /**
     *
     * @param dir Directory of class or interface entity sources. This directory must include only entities.¬
     */
    convertFromDir(dir: string): ModelOptions[] {
        const srcPaths: string[] = [];
        const setSrcPaths = (dir: string) => {
            fs.readdirSync(dir).forEach(path => {
                const fullPath = `${dir}/${path}`;
                if (fs.statSync(fullPath).isDirectory()) {
                    setSrcPaths(fullPath);
                } else {
                    srcPaths.push(fullPath);
                }
            });
        };
        setSrcPaths(dir);
        return this.convertFromFiles(srcPaths);
    }

    /**
     *
     * @param srcPaths class or interface entity source's paths. If entity has some dependency, you must specify its path simultaneously.
     * @return ModelOptions[]
     * see https://docs.aws.amazon.com/cdk/api/latest/docs/aws-apigateway-readme.html#working-with-models
     * and https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-apigateway.ModelOptions.html
     */
    convertFromFiles(srcPaths: string[]): ModelOptions[] {
        const results = [];

        for (const srcPath of srcPaths) {
            const sourceFile = ts.createSourceFile(srcPath, fs.readFileSync(srcPath).toString(), ScriptTarget.ES5, true);
            const properties: { [name: string]: JsonSchema; } = {};
            let modelName = '';

            const visit = (node: Node) => {
                if (ts.isInterfaceDeclaration(node)) {
                    modelName = (node as InterfaceDeclaration).name.escapedText as string;
                    node.members.forEach(member => {
                        CdkApigUtility.setProperties(member, properties);
                    });
                } else if (ts.isClassDeclaration(node)) {
                    modelName = ((node as ClassDeclaration).name as Identifier).escapedText as string;
                    node.members.forEach(member => {
                        CdkApigUtility.setProperties(member, properties);
                    });
                }
                ts.forEachChild(node, visit);
            };

            ts.forEachChild(sourceFile, visit);
            results.push({
                contentType: 'application/json',
                modelName: modelName,
                schema: {
                    schema: JsonSchemaVersion.DRAFT4,
                    type: JsonSchemaType.OBJECT,
                    properties: properties
                }
            });
        }
        this.replaceRefToProps(results);
        return results;
    }

    private replaceRefToProps(results: ModelOptions[]) {
        results.forEach(modelOption => {
            const entries = Object.entries(modelOption.schema.properties as JsonSchema);
            entries.forEach(entry => {
                const key = entry[0];
                const value = entry[1];
                if (value.ref) {
                    const refObj = results.find(result => result.modelName === value.ref);
                    if (refObj) {
                        value.properties = refObj.schema.properties;
                        delete value.ref;
                    }
                } else if (value.items && value.items.ref) {
                    const refObj = results.find(result => result.modelName === value.items.ref);
                    if (refObj) {
                        value.items.properties = refObj.schema.properties;
                        delete value.items.ref;
                    }
                }
            });
        });
    }

    private static setProperties(memberNode: Node, properties: { [name: string]: JsonSchema; }): void {
        let propertyName: string | null = null;
        let typeName: JsonSchemaType | null = null;
        let arrayChild: Node | null = null;
        let typeReference: string | null = null;

        for (const child of memberNode.getChildren()) {
            switch (child.kind) {
                case SyntaxKind.Identifier:
                    propertyName = child.getText();
                    break;
                case SyntaxKind.StringKeyword:
                    typeName = JsonSchemaType.STRING;
                    break;
                case SyntaxKind.NumberKeyword:
                    typeName = JsonSchemaType.NUMBER;
                    break;
                case SyntaxKind.BooleanKeyword:
                    typeName = JsonSchemaType.BOOLEAN;
                    break;
                case SyntaxKind.ObjectKeyword:
                    typeName = JsonSchemaType.OBJECT;
                    break;
                case SyntaxKind.TypeReference:
                    typeName = JsonSchemaType.OBJECT;
                    typeReference = child.getText();
                    break;
                case SyntaxKind.ArrayType:
                    typeName = JsonSchemaType.ARRAY;
                    arrayChild = child;
                    break;
                case SyntaxKind.NullKeyword:
                    typeName = JsonSchemaType.NULL;
                    break;
            }
        }
        if (propertyName && typeName) {
            CdkApigUtility._setProperties(properties, propertyName, typeName, arrayChild, typeReference);
        }

    }

    private static _setProperties(properties: { [name: string]: JsonSchema; }, propertyName: string,
                                  typeName: JsonSchemaType, arrayChild: Node | null, typeReference: string | null) {
        if (arrayChild) {
            const arrayType = CdkApigUtility.getJsonSchemaType(arrayChild);
            if (arrayType) {
                if (arrayType !== 'string' && arrayType !== 'number' && arrayType !== 'boolean' &&
                    arrayType !== 'array' && arrayType !== 'object') {
                    properties[propertyName] = {
                        type: typeName,
                        items: {type: JsonSchemaType.OBJECT, ref: arrayType}
                    };
                } else {
                    properties[propertyName] = {
                        type: typeName,
                        items: {type: arrayType as JsonSchemaType}
                    };
                }
            }
        } else if (typeReference) {
            properties[propertyName] = {type: JsonSchemaType.OBJECT, ref: typeReference};

        } else {
            properties[propertyName] = {type: typeName};
        }
    }

    private static getJsonSchemaType(arrayNode: ts.Node): JsonSchemaType | string | null {
        for (const node of arrayNode.getChildren()) {
            switch (node.kind) {
                case SyntaxKind.StringKeyword:
                    return JsonSchemaType.STRING;
                case SyntaxKind.NumberKeyword:
                    return JsonSchemaType.NUMBER;
                case SyntaxKind.BooleanKeyword:
                    return JsonSchemaType.BOOLEAN;
                case SyntaxKind.ObjectKeyword:
                    return JsonSchemaType.OBJECT;
                case SyntaxKind.TypeReference:
                    return node.getText();
                case SyntaxKind.ArrayType:
                    return JsonSchemaType.ARRAY;
            }
        }
        return null;
    }

}
