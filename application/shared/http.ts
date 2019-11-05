export function createHttpResponse(statusCode: number, message: any) {
    return {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        statusCode: statusCode,
        body: typeof(message) == "string"? JSON.stringify({message: message}): JSON.stringify(message)
    }
}