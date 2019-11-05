import { Construct, RemovalPolicy } from "@aws-cdk/core";
import { Function, Code, Runtime, LayerVersion } from "@aws-cdk/aws-lambda";
import { RestApi, LambdaIntegration, Resource, AuthorizationType, CfnAuthorizer, CfnAuthorizerProps, LambdaIntegrationOptions, IAuthorizer } from "@aws-cdk/aws-apigateway";
import path = require('path');
import { out } from "../utils";
import { Table, AttributeType, BillingMode } from "@aws-cdk/aws-dynamodb";
import { MicroServiceProps } from "../props";
import { config } from "../../config";

export class ExpenseMicroService extends Construct {

    readonly expenseDynamoTable: Table;
    private authorizer: IAuthorizer;

    constructor(parent: Construct, name: string, private props: MicroServiceProps) {
        super(parent, name);

        this.expenseDynamoTable = this.createDynamoTable();

        const api: RestApi = new RestApi(this, "ExpenseApi", {
            deployOptions: {
                stageName: 'dev'
            },
            retainDeployments: true
        });

        // this.createAuthorizer(api);

        const expensesResource = api.root.addResource("expenses");

        this.recordExpenseApi(expensesResource);
        this.getExpenseApi(expensesResource);

        props.domainName.addBasePathMapping(api, {basePath: 'expensems'});
        
        out(this, "ExpenseResourceUrl", expensesResource.restApi.url);
    }

    private recordExpenseApi(expensesResource: Resource) {

        const recordExpenceFunction = this.newLambdaFunction("./application/expense-ms/record", 'RecordExpenseFunction');
        this.expenseDynamoTable.grantFullAccess(recordExpenceFunction);
        expensesResource.addMethod('POST', new LambdaIntegration(recordExpenceFunction));

    }

    private getExpenseApi(expensesResource: Resource) {

        const getExpenceFunction = this.newLambdaFunction("./application/expense-ms/fetch", "GetExpenseFunction");
        this.expenseDynamoTable.grantReadData(getExpenceFunction);
        expensesResource.addMethod('GET', new LambdaIntegration(getExpenceFunction));
    }

    private newLambdaFunction(pathToHandler: string, name: string) {

        const pathToRoot = path.join(__dirname, '../../');
        const recordExpenceFunction = new Function(this, name, {
            functionName: name,
            code: Code.asset(pathToRoot),
            handler: `${pathToHandler}/index.handler`,
            runtime: Runtime.NODEJS_10_X,
            layers: [this.props.nodeModulesLayer]
        });

        return recordExpenceFunction;
    }

    createDynamoTable(): Table {

        const table = new Table(this, 'ExpenseDynamoTable', {
            partitionKey: { name: 'pk', type: AttributeType.STRING },
            sortKey: { name: 'sk', type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            tableName: `expense-table-demo`,
            removalPolicy: RemovalPolicy.DESTROY
            
        });

        return table;
    }

    private createAuthorizer(api: RestApi) {

        const props: CfnAuthorizerProps = {
            name: 'CognitoAuthorizer',
            type: AuthorizationType.COGNITO,
            restApiId: api.restApiId,
            identitySource: 'method.request.header.Authorization',
            providerArns: [config.userPoolArns]

        };
        const cfnAuthorizer = new CfnAuthorizer(this, 'CognitoAuthorizer', props);
        this.authorizer = {
            authorizerId: cfnAuthorizer.ref,
        };

    }
}