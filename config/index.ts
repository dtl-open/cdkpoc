export const config: AppConfig = {
    awsAccountNumber: '',
    certificateArn: '',
    hostedZoneId: '',
    domain: '',
    userPoolArns: ''
}

export interface AppConfig {
    awsAccountNumber: string;
    certificateArn: string;
    hostedZoneId: string;
    domain: string;
    userPoolArns: string;
}