import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
export class MindfulBrowseStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment } = props;
        // DynamoDB Table for storing events and user profiles
        this.table = new dynamodb.Table(this, 'MindfulBrowseTable', {
            tableName: `MindfulBrowse-${environment}`,
            partitionKey: {
                name: 'PK',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'SK',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: environment === 'prod'
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
            pointInTimeRecovery: environment === 'prod',
        });
        // Cognito User Pool for authentication
        this.userPool = new cognito.UserPool(this, 'MindfulBrowseUserPool', {
            userPoolName: `mindful-browse-${environment}`,
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: environment === 'prod'
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
        });
        // Cognito Domain for Hosted UI
        const userPoolDomain = this.userPool.addDomain('MindfulBrowseDomain', {
            cognitoDomain: {
                domainPrefix: `mindful-browse-${environment}`,
            },
        });
        // User Pool Client for Dashboard and Extension
        this.userPoolClient = new cognito.UserPoolClient(this, 'MindfulBrowseUserPoolClient', {
            userPool: this.userPool,
            userPoolClientName: `mindful-browse-client-${environment}`,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            accessTokenValidity: cdk.Duration.hours(1),
            refreshTokenValidity: cdk.Duration.days(30),
            idTokenValidity: cdk.Duration.hours(1),
            preventUserExistenceErrors: true,
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls: [
                    'http://localhost:5173',
                    'http://localhost:5173/',
                    // CloudFront URL will be added after distribution is created
                ],
                logoutUrls: [
                    'http://localhost:5173',
                    'http://localhost:5173/',
                    // CloudFront URL will be added after distribution is created
                ],
            },
        });
        // Lambda function for event processing
        this.eventProcessorFunction = new lambda.Function(this, 'EventProcessorFunction', {
            functionName: `mindful-browse-processor-${environment}`,
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda-functions/dist'),
            memorySize: 512,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: this.table.tableName,
                LOG_LEVEL: environment === 'prod' ? 'INFO' : 'DEBUG',
                BEDROCK_HAIKU_MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0',
                BEDROCK_SONNET_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
                ENVIRONMENT: environment,
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
        });
        // Grant Lambda permissions to DynamoDB
        this.table.grantReadWriteData(this.eventProcessorFunction);
        // Grant Lambda permissions to Amazon Comprehend
        this.eventProcessorFunction.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['comprehend:DetectSentiment'],
            resources: ['*'],
        }));
        // API Gateway with Cognito authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [this.userPool],
            authorizerName: `mindful-browse-authorizer-${environment}`,
        });
        this.api = new apigateway.RestApi(this, 'MindfulBrowseApi', {
            restApiName: `mindful-browse-api-${environment}`,
            description: 'Mindful Browse MVP API',
            deployOptions: {
                stageName: environment,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
                metricsEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'Authorization',
                    'X-Amz-Date',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
                allowCredentials: true,
            },
            cloudWatchRole: true,
        });
        // Lambda integration
        const lambdaIntegration = new apigateway.LambdaIntegration(this.eventProcessorFunction, {
            proxy: true,
        });
        // POST /events endpoint
        const eventsResource = this.api.root.addResource('events');
        eventsResource.addMethod('POST', lambdaIntegration, {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // GET /insights endpoint
        const insightsResource = this.api.root.addResource('insights');
        insightsResource.addMethod('GET', lambdaIntegration, {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // S3 bucket for dashboard static hosting
        this.dashboardBucket = new s3.Bucket(this, 'DashboardBucket', {
            bucketName: `mindful-browse-dashboard-${environment}-${this.account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: environment === 'prod'
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod',
        });
        // CloudFront distribution for dashboard
        this.distribution = new cloudfront.Distribution(this, 'DashboardDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(this.dashboardBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5),
                },
            ],
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        });
        // Output table name
        new cdk.CfnOutput(this, 'TableName', {
            value: this.table.tableName,
            description: 'DynamoDB table name',
            exportName: `${environment}-MindfulBrowseTableName`,
        });
        // Output Cognito User Pool ID
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            description: 'Cognito User Pool ID',
            exportName: `${environment}-MindfulBrowseUserPoolId`,
        });
        // Output Cognito User Pool Client ID
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
            exportName: `${environment}-MindfulBrowseUserPoolClientId`,
        });
        // Output Cognito Domain
        new cdk.CfnOutput(this, 'CognitoDomain', {
            value: userPoolDomain.domainName,
            description: 'Cognito Hosted UI Domain',
            exportName: `${environment}-MindfulBrowseCognitoDomain`,
        });
        // Output Cognito Hosted UI URL
        new cdk.CfnOutput(this, 'CognitoHostedUIUrl', {
            value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
            description: 'Cognito Hosted UI URL',
            exportName: `${environment}-CognitoHostedUIUrl`,
        });
        // Output Lambda function ARN
        new cdk.CfnOutput(this, 'EventProcessorFunctionArn', {
            value: this.eventProcessorFunction.functionArn,
            description: 'Event processor Lambda function ARN',
            exportName: `${environment}-EventProcessorFunctionArn`,
        });
        // Output API Gateway URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.url,
            description: 'API Gateway URL',
            exportName: `${environment}-MindfulBrowseApiUrl`,
        });
        // Output S3 bucket name
        new cdk.CfnOutput(this, 'DashboardBucketName', {
            value: this.dashboardBucket.bucketName,
            description: 'Dashboard S3 bucket name',
            exportName: `${environment}-DashboardBucketName`,
        });
        // Output CloudFront distribution domain
        new cdk.CfnOutput(this, 'DashboardUrl', {
            value: `https://${this.distribution.distributionDomainName}`,
            description: 'Dashboard CloudFront URL',
            exportName: `${environment}-DashboardUrl`,
        });
        // Output CloudFront distribution ID
        new cdk.CfnOutput(this, 'DistributionId', {
            value: this.distribution.distributionId,
            description: 'CloudFront distribution ID',
            exportName: `${environment}-DistributionId`,
        });
    }
}
//# sourceMappingURL=mindful-browse-stack.js.map