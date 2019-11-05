import { DomainName } from "@aws-cdk/aws-apigateway";
import { LayerVersion } from "@aws-cdk/aws-lambda";

export interface MicroServiceProps {

    domainName: DomainName;
    nodeModulesLayer: LayerVersion;
}