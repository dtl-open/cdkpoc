
import * as path from "path";
import { Stack, App, StackProps, Tag } from "@aws-cdk/core";
import { MicroServiceProps } from "../props";
import { ExpenseMicroService } from "../constructs/expense-ms";
import { LayerVersion, Code, Runtime } from "@aws-cdk/aws-lambda";
import { DomainNameProps, EndpointType, DomainName } from "@aws-cdk/aws-apigateway";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZoneAttributes, IHostedZone, HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { ApiGatewayDomain } from "@aws-cdk/aws-route53-targets";
import { config } from "../../config";

export class MicroServicesInfraStack extends Stack {

    constructor(parent: App, name: string, props: StackProps) {

        super(parent, name, props);

        try {

            this.addTags();

            const msProps: MicroServiceProps = this.microServiceProps();
 
            new ExpenseMicroService(this, 'ExpenseMicroservice', msProps);
            
            
        } catch (e) {

            console.error("Failed to create miro service stack: ", e);
        }
    }

    private addTags(): void {
        
        Tag.add(this, 'Project', 'POC');
        Tag.add(this, 'Application', 'CDK_SERVERLESS');
    }

    private microServiceProps(): MicroServiceProps {
        
        const certificateArn = config.certificateArn;
        const hostedZoneId = config.hostedZoneId;
        const nodeModulesLayer = this.nodeLambdaLayer();
        const zoneName = config.domain;
        const domain = `api.${zoneName}`;

        const domainName: DomainName = this.createCustomDomain(domain, certificateArn);

        this.addARecordForCustomDomain(hostedZoneId, zoneName, domain, domainName);

        const msProps: MicroServiceProps = {
            domainName,
            nodeModulesLayer
        };

        return msProps;
    }

    private nodeLambdaLayer(): LayerVersion {

        const libPath = path.join(__dirname, "./../layers");
        console.debug("Lambda layer folder: " + libPath);
        
        const nodeModulesLayer: LayerVersion = new LayerVersion(this, "DependencyLayer", {
            code: Code.asset(libPath),
            compatibleRuntimes: [Runtime.NODEJS_10_X],
            license: 'Apache-2.0',
            description: 'Node modules layer',
        });

        console.debug("Lambda layer: ", nodeModulesLayer);
        return nodeModulesLayer;
    }

    private addARecordForCustomDomain(hostedZoneId: string, zoneName: string, domain: string, domainName: DomainName) {
        
        const hsAtr: HostedZoneAttributes = {
            hostedZoneId,
            zoneName
        };

        const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'DemoHostedZone', hsAtr);
        
        new ARecord(this, 'CustomDomainARecord', {
            zone: hostedZone,
            recordName: domain,
            target: RecordTarget.fromAlias(new ApiGatewayDomain(domainName))
        });
    }

    private createCustomDomain(domain: string, certificateArn: string) {

        const domainNameProps: DomainNameProps = {
            domainName: domain,
            certificate: Certificate.fromCertificateArn(this, 'Cert', certificateArn),
            endpointType: EndpointType.REGIONAL
        };
        const domainName: DomainName = new DomainName(this, 'DemoDomain', domainNameProps);

        return domainName;
    }
}