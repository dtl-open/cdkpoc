import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { dynamoDBDocumentClient } from "../../shared/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHttpResponse } from "../../shared/http";
import * as _ from "lodash";

AWS.config.update({region: 'ap-southeast-2'});

const OP = 'Get expenses for user';

export const handler = async (event: APIGatewayEvent): Promise<any> => {

    console.debug(OP + ' request recieved with path parameters' + JSON.stringify(event.pathParameters));
    
    try {

        const userId = event.pathParameters!.userId;
        const items = await getExpensesForUser(userId);

        console.info(OP + ' performed successfully for user ' + userId)

        return createHttpResponse(200, items);

    } catch(e) {
        const m = `Failed to get expenses. Error is ${e.message}`;
        console.warn(m);
        return createHttpResponse(200, m);
    }
}

async function getExpensesForUser(userId: string) {
    const params: DocumentClient.QueryInput = {
        TableName: `expense-table-demo`,
        KeyConditionExpression:'pk = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    console.debug("Query param: ", params);

    return new Promise((resolve, reject) => {

        dynamoDBDocumentClient().query(params, (err: AWS.AWSError, result: DocumentClient.QueryOutput) => {

            if (err) {
                const message = OP + " failed to perform dynamo query. Error is: " + JSON.stringify(err.message);
                console.warn(message);
                reject(new Error(message));
            }
            console.debug(OP + " performed dynamo query successufully. Result is: ", JSON.stringify(result));
            resolve(result.Items);
        })
    });
}