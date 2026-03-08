import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
export interface MindfulBrowseStackProps extends cdk.StackProps {
    environment: string;
}
export declare class MindfulBrowseStack extends cdk.Stack {
    readonly table: dynamodb.Table;
    readonly userPool: cognito.UserPool;
    readonly userPoolClient: cognito.UserPoolClient;
    readonly eventProcessorFunction: lambda.Function;
    readonly api: apigateway.RestApi;
    readonly dashboardBucket: s3.Bucket;
    readonly distribution: cloudfront.Distribution;
    constructor(scope: Construct, id: string, props: MindfulBrowseStackProps);
}
//# sourceMappingURL=mindful-browse-stack.d.ts.map