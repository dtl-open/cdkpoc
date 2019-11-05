# Before you run
- Fill the config/index.ts with values relevant to your AWS environment.
- If you need to check the custom authoriser functionality, first create a cognito user pool with some appclient linked. This is to create a user to test the APIs. Otherwise, you can test the entire PoC without custom authoriser attached.

# Useful commands

Assuming that you have created an aws profile called 'dtldev' with required privilages. Otherwise create one with the name you like and change the scripts section in `package.json`   

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run deploy`  deploy this stack to your default AWS account/region
 * `npm run diff`    compare deployed stack with current state
 * `npm run synth`   emits the synthesized CloudFormation template


# Notes

## Custom Authoriser
Custom authoriser is taken out to make the testing easier.

## Running for the first time
 ❌  DemoAppMicroServiceStack failed: Error: This stack uses assets, so the toolkit stack must be deployed to the environment (Run "cdk bootstrap aws://<AWS_ACCOUNT_NUMBER>/ap-southeast-2")
