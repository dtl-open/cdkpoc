#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { MicroServicesInfraStack } from './infra/stacks/microservices';
import { Environment } from '@aws-cdk/core';
import { config } from "./config";

const app = new cdk.App();
const accountNumber: string = config.awsAccountNumber;

const demoEnv: Environment = {account: accountNumber, region: 'ap-southeast-2'};

new MicroServicesInfraStack(app, 'DemoAppMicroServiceStack', {env: demoEnv});
