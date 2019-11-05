import * as AWS from "aws-sdk";

const runEnv = process.env['RUN_ENV'];

export function dynamoDb(): AWS.DynamoDB {

    if (runEnv === 'local') {

        console.log('Using local dynamo ...');

        return new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            region: "ap-southeast-1",
            endpoint: "http://localhost:8001",
            accessKeyId: "AKIATPCMNGQTBB2U7A42"
        });

    } else {

        return new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            region: "ap-southeast-2"
        });
    }
}

export function dynamoDBDocumentClient() {

    if (runEnv === "local") {
        AWS.config.dynamodb = {
            apiVersion: "2012-08-10",
            region: "ap-southeast-1",
            endpoint: "http://localhost:8000",
            accessKeyId: "AKIATPCMNGQTBB2U7A42"
        }
    } else {
        AWS.config.dynamodb = {
            apiVersion: "2012-08-10",
            region: "ap-southeast-2"
        }
    }

    const dynamodb = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true })
    return dynamodb;
}


