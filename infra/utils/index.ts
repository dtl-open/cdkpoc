import { Construct, CfnOutput } from "@aws-cdk/core";

export function out(parent: Construct, name: string, value: any) {
    
    return new CfnOutput(parent, name, { value });
}