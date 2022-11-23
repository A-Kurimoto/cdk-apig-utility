import {JsonSchema, JsonSchemaType, JsonSchemaVersion, ModelOptions} from 'aws-cdk-lib/aws-apigateway';
import * as ts from 'typescript';
import {
    ClassDeclaration,
    Identifier,
    InterfaceDeclaration,
    Node,
    ParameterDeclaration,
    ScriptKind,
    ScriptTarget,
    SyntaxKind
} from 'typescript';
import * as fs from 'fs';

export class CdkApigUtility {
    private apiId: string | undefined = undefined;
    public emitRequired: boolean = false;
    /**
     * Constructor
     * @param restApiId - The id of the rest api for which model will be built
     */
    constructor(restApiId?: string) {
      this.apiId = restApiId;
    }
    /**
     * You can get query string parameters from method's argument.
     * (This method is not support header or path parameters.)
     * @param srcPath
     * @param methodName
     * @return MethodOptions#requestParameters
     */
    getRequestQueryStringParams(srcPath: string, methodName: string): { [param: string]: boolean } {
      const result: { [param: string]: boolean } = {};
      const sourceFile = ts.createSourceFile(srcPath, fs.readFileSync(srcPath).toString(), ScriptTarget.ES5,
        true, ScriptKind.TS);
      const visit = (node: Node) => {
        if (ts.isMethodDeclaration(node)) {
          let isTargetMethod = false;
          node.getChildren().forEach(child => {
            if (ts.isIdentifier(child) && child.getText() === methodName) {
              isTargetMethod = true;
            }
          });
          if (isTargetMethod) {
            node.getChildren().forEach(child => {
              if (child.kind === SyntaxKind.SyntaxList) {
                child.getChildren().forEach(gChild => {
                  if (gChild.kind === SyntaxKind.Parameter) {
                    let paramName = '';
                    let isRequired = true;
                    gChild.getChildren().forEach(ggChild => {
                      if (ts.isIdentifier(ggChild)) {
                        paramName = ggChild.getText();
                      } else if (ggChild.kind === SyntaxKind.QuestionToken) {
                        isRequired = false;
                      }
                    });
                    result[`method.request.querystring.${paramName}`] = isRequired;
                  }
                });
              }
            });
          }
        }
        ts.forEachChild(node, visit);
      };
      ts.forEachChild(sourceFile, visit);
      return result;
    }
  
   /**
     * You can get argument names and those descriptions written in the JSDoc as @param so as to use {CfnDocumentationPart}
     * easily.
     * @param srcPath
     * @param methodName
     */
   getArgumentDescriptions(srcPath: string, methodName: string): { name: string, description: string }[] {
    const result: { name: string, description: string }[] = [];
    const sourceFile = ts.createSourceFile(srcPath, fs.readFileSync(srcPath).toString(), ScriptTarget.ES5,
        true, ScriptKind.TS);
    const visit = (node: Node) => {
        if (ts.isMethodDeclaration(node)) {
            let isTargetMethod = false;
            node.getChildren().forEach(child => {
                if (ts.isIdentifier(child) && child.getText() === methodName) {
                    isTargetMethod = true;
                }
            });
            if (isTargetMethod) {
                node.getChildren().forEach(child => {
                    if (child.kind === SyntaxKind.SyntaxList) {
                        child.getChildren().forEach(gChild => {
                            if (gChild.kind === SyntaxKind.Parameter) {
                                let paramName = '';
                                gChild.getChildren().forEach(ggChild => {
                                    if (ts.isIdentifier(ggChild)) {
                                        paramName = ggChild.getText();
                                    }
                                });
                                const paramTags = ts.getJSDocParameterTags(gChild as ParameterDeclaration);
                                paramTags.forEach(paramTag => {
                                    if (paramName && paramTag.comment) {
                                        if (typeof paramTag.comment === 'string') {
                                            result.push({name: paramName, description: paramTag.comment})
                                        } else {
                                            result.push({name: paramName, description: paramTag.comment.toString()})
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return result;
  }


    /**
     *
     * @param dir Directory of class or interface entity sources. It also search sub-directory. This directory must include only entities.
     */
    getModelsFromDir(dir: string): ModelOptions[] {
      return this.getResponseModelsFromDir(dir);
    } 
  
    /**
     * @param srcPaths class or interface entity source's paths. If entity has some dependency, you must specify its path simultaneously.
     * @return ModelOptions[]
     * see https://docs.aws.amazon.com/cdk/api/latest/docs/aws-apigateway-readme.html#working-with-models
     * and https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-apigateway.ModelOptions.html
     */
    getModelsFromFiles(srcPaths: string[]): ModelOptions[] {
      return this.getResponseModelsFromFiles(srcPaths);
    }
  
    /**
     * @deprecated please use {@function getModelsFromDir}
     */
    getResponseModelsFromDir(dir: string): ModelOptions[] {
      return this.convertFromDir(dir);
    }
  
    /**
     * @deprecated please use {@function getModelsFromFiles}
     */
    getResponseModelsFromFiles(srcPaths: string[]): ModelOptions[] {
      return this.convertFromFiles(srcPaths);
    }
  
    /**
     * @deprecated please use {@function getResponseModelsFromDir}
     */
    convertFromDir(dir: string): ModelOptions[] {
      return this.convertFromFiles(this.getSrcPaths(dir));
    }
  
    /**
     * @deprecated please use {@function getResponseModelsFromFiles}
     */
    convertFromFiles(srcPaths: string[]): ModelOptions[] {
      const results: ModelOptions[] = [];
  
      for (const srcPath of srcPaths) {
        const sourceFile = ts.createSourceFile(srcPath, fs.readFileSync(srcPath).toString(), ScriptTarget.ES5, true, ScriptKind.TS);
  
        const models: { modelName: string, properties: { [name: string]: JsonSchema; }, required: string[] }[] = [];
  
        const visit = (node: Node) => {
          if (ts.isInterfaceDeclaration(node)) {
            const modelName = (node as InterfaceDeclaration).name.escapedText as string;
            const properties: { [name: string]: JsonSchema; } = {};
            const required: string[] = [];
            models.push({ modelName, properties, required });
            node.members.forEach(member => {
              if (member.kind === SyntaxKind.PropertySignature) {
                CdkApigUtility.setProperties(member, properties, required, this.apiId);
              }
            });
          } else if (ts.isClassDeclaration(node)) {
            const modelName = ((node as ClassDeclaration).name as Identifier).escapedText as string;
            const properties: { [name: string]: JsonSchema; } = {};
            const required: string[] = [];
            models.push({ modelName, properties, required });
            node.members.forEach(member => {
              if (member.kind === SyntaxKind.PropertyDeclaration) {
                CdkApigUtility.setProperties(member, properties, required, this.apiId);
              }
            });
          }
          ts.forEachChild(node, visit);
        };
  
        ts.forEachChild(sourceFile, visit);
        models.forEach(model => {
          let modelOptions = {
            contentType: 'application/json',
            modelName: model.modelName,
            schema: {
              schema: JsonSchemaVersion.DRAFT4,
              type: JsonSchemaType.OBJECT,
              properties: model.properties,
            },
          };
          if (model.required.length && this.emitRequired) {
            modelOptions.schema.required = model.required;
          }
          results.push(modelOptions);
        });
      }
      this.replaceRefToProps(results);
      return results;
    }
  
    private getSrcPaths(dir: string): string[] {
      const srcPaths: string[] = [];
      const setSrcPaths = (dir: string) => {
        fs.readdirSync(dir).forEach(path => {
          const fullPath = `${dir}/${path}`;
          if (fs.statSync(fullPath).isDirectory()) {
            setSrcPaths(fullPath);
          } else {
            if (fullPath.endsWith('.ts')) {
              srcPaths.push(fullPath);
            }
          }
        });
      };
      setSrcPaths(dir);
      return srcPaths;
    }
  
    private replaceRefToProps(results: ModelOptions[]) {
      results.forEach(modelOption => {
        const values: JsonSchema[] = Object.values(modelOption.schema.properties as JsonSchema);
        values.forEach(value => {
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
  
    private static setProperties(memberNode: Node, properties: { [name: string]: JsonSchema; }, required: string[] = [], restApiId: string | undefined): void {
      let propertyName: string | null = null;
      let typeName: JsonSchemaType | null = null;
      let arrayChild: Node | null = null;
      let typeReference: string | null = null;
      
      for (const child of memberNode.getChildren()) {
        switch (child.kind) {
          case SyntaxKind.Identifier:
            propertyName = child.getText();
            /*
            * Check for the ? token to see if the property is required or not.  
            * If marked with ?, the property is not required.
            * If not marked with ?, the property is required and will be included in the required array
            */
            if (propertyName && child.parent.questionToken === undefined) {
              required.push(propertyName);
            }
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
          case SyntaxKind.UnionType:
            let unionTypes: { type: JsonSchemaType, child?: Node, reference?: string }[] = [];
            for (const gChild of child.getChildren()) {
              if (gChild.kind === SyntaxKind.SyntaxList) {
                for (const ggChild of gChild.getChildren()) {
                  const jsonSchemaType = CdkApigUtility.getNotNullType(ggChild);
                  if (jsonSchemaType) {
                    unionTypes.push(jsonSchemaType);
                  }
                }
              }
            }
            if (unionTypes.length === 1) {
              typeName = unionTypes[0].type;
              if (unionTypes[0].child) {
                arrayChild = unionTypes[0].child;
              }
              if (unionTypes[0].reference) {
                typeReference = unionTypes[0].reference;
              }
            }
            break;
        }
      }
      if (propertyName && typeName) {
        const description = CdkApigUtility.getDescription(memberNode);
        CdkApigUtility._setProperties(properties, propertyName, description, typeName, arrayChild, typeReference, restApiId);
      }
    }
  
    private static getNotNullType(node: Node): { type: JsonSchemaType, child?: Node, reference?: string } | null {
      switch (node.kind) {
        case SyntaxKind.StringKeyword:
          return { type: JsonSchemaType.STRING };
        case SyntaxKind.NumberKeyword:
          return { type: JsonSchemaType.NUMBER };
        case SyntaxKind.BooleanKeyword:
          return { type: JsonSchemaType.BOOLEAN };
        case SyntaxKind.ObjectKeyword:
          return { type: JsonSchemaType.OBJECT };
        case SyntaxKind.TypeReference:
          return { type: JsonSchemaType.OBJECT, reference: node.getText() };
        case SyntaxKind.ArrayType:
          return { type: JsonSchemaType.ARRAY, child: node };
      }
      return null;
    }
  
    private static getDescription(node: Node): string {
      const jsDocTags = ts.getJSDocTags(node);
      if (jsDocTags) {
          for (const tag of jsDocTags) {
              if (tag.tagName.escapedText === 'desc' || tag.tagName.escapedText === 'description') {
                  if (tag.comment) {
                      if (typeof tag.comment === 'string') {
                          return tag.comment;
                      } else {
                          return tag.comment.toString();
                      }
                  }
                  return 'No description.';
              }
          }
      }
      return 'No description.';
    }
  
    private static _setProperties(properties: { [name: string]: JsonSchema; }, propertyName: string, description: string,
      typeName: JsonSchemaType, arrayChild: Node | null, typeReference: string | null, restApiId: string | undefined) {
      if (arrayChild) {
        const arrayType = CdkApigUtility.getJsonSchemaType(arrayChild);
        if (arrayType) {
          if (arrayType !== 'string' && arrayType !== 'number' && arrayType !== 'boolean' &&
            arrayType !== 'array' && arrayType !== 'object') {
            /*
            * If restApId was set in the constructor, a model referenced will use a reference as opposed to including the properties
            */
            if (restApiId) {
              properties[propertyName] = {
                type: typeName,
                description: description,
                items: { type: JsonSchemaType.OBJECT, ref: `https://apigateway.amazonaws.com/restapis/${restApiId}/models/${arrayType}` }
              };
            }
            else {
              properties[propertyName] = {
                type: typeName,
                description: description,
                items: { type: JsonSchemaType.OBJECT, ref: arrayType }
              };
            }
          } else {
            properties[propertyName] = {
              type: typeName,
              description: description,
              items: { type: arrayType as JsonSchemaType }
            };
          }
        }
      } else if (typeReference) {
        /*
        * If restApId was set in the constructor, a model referenced will use a reference as opposed to including the properties
        */
        if (restApiId) {
          properties[propertyName] = { type: JsonSchemaType.OBJECT, description: description, ref: `https://apigateway.amazonaws.com/restapis/${restApiId}/models/${typeReference}` };
        } else {
          properties[propertyName] = { type: JsonSchemaType.OBJECT, description: description, ref: typeReference };
        }
      } else {
        properties[propertyName] = { type: typeName, description: description };
      }
  
      /*
      * If there is no description or description startsWith 'No description', remove the description property as it need not be emitted
      */
      if ((!description || description.startsWith('No description'))
         && properties[propertyName]) {
          delete properties[propertyName]['description'];
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
          case SyntaxKind.NullKeyword:
            return JsonSchemaType.NULL;
        }
      }
      return null;
    }
  
  }
x