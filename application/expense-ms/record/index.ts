import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { dynamoDBDocumentClient } from "../../shared/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHttpResponse } from "../../shared/http";
import * as _ from "lodash";

import moment = require("moment");

AWS.config.update({ region: 'ap-southeast-2' });

export const handler = async (event: APIGatewayEvent): Promise<any> => {

    try {

        const command: RecordExpenseCommand = JSON.parse(event.body!);

        console.info(`Record expense request recieved ${JSON.stringify(command)}`);
        const userId = event.headers['x-user-id'];
        await recordExpense(command, userId);

        const createdAt = moment().format();

        const resp = _.assign({userId, createdAt}, command);

        return createHttpResponse(201, resp);

    } catch (e) {

        const m = `Failed to record expense. Error is ${e.message}`;
        console.warn(m);
        return createHttpResponse(500, m);
    }
}

async function recordExpense(command: RecordExpenseCommand, userId: string) {
    const params: DocumentClient.PutItemInput = {
        TableName: `expense-table-demo`,
        Item: {
            "pk": userId,
            "sk": `${command.expenseType}_${command.recordedAt}`,
            "userId": userId,
            "recordedAt": command.recordedAt,
            "expenseType": command.expenseType,
            "amount": command.amount.toFixed(2),
            "labels": command.labels
        }
    }

    return new Promise((resolve, reject) => {
        dynamoDBDocumentClient().put(params, (err: AWS.AWSError, result: DocumentClient.PutItemOutput) => {
            if (err) {
                console.log("Error: ", err);
                reject(createHttpResponse(404, "Cannot find settings for required id"));
            }
            console.debug("Result: ", result);
            resolve(result);
        })
    });
}


interface RecordExpenseCommand {
    recordedAt: string;
    expenseType: string;
    amount: number;
    labels: string[];
}
