import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface MindfulBrowseStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
}

export class MindfulBrowseStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly dataTable: dynamodb.Table;
  public readonly backupBucket: s3.Bucket;
  public readonly kmsKey: kms.Key;
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: MindfulBrowseStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // KMS Key for encryption
    this.kmsKey = new kms.Key(this, 'MindfulBrowseKMSKey', {
      alias: `mindful-browse-${environment}-key`,
      description: 'KMS key for Mindful Browse data encryption',
      enableKeyRotation: true,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB Table for user data and metrics
    this.dataTable = new dynamodb.Table(this, 'MindfulBrowseDataTable', {
      tableName: `mindful-browse-data-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.kmsKey,
      timeToLiveAttribute: 'TTL',
      pointInTimeRecovery: environment === 'prod',
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Global Secondary Index for cross-user analytics
    this.dataTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    // S3 Bucket for encrypted backups (opt-in)
    this.backupBucket = new s3.Bucket(this, 'MindfulBrowseBackupBucket', {
      bucketName: `mindful-browse-backups-${environment}-${this.account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
        {
          id: 'DeleteIncompleteUploads',
          enabled: true,
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool for authentication
    this.userPool = new cognito.UserPool(this, 'MindfulBrowseUserPool', {
      userPoolName: `mindful-browse-users-${environment}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'MindfulBrowseUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `mindful-browse-client-${environment}`,
      generateSecret: false, // For browser extension compatibility
      authFlows: {
        userSrp: true,
        userPassword: false, // Disable for security
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
      },
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
    });

    // VPC for ECS and other resources
    this.vpc = new ec2.Vpc(this, 'MindfulBrowseVPC', {
      vpcName: `mindful-browse-vpc-${environment}`,
      maxAzs: 2,
      natGateways: environment === 'prod' ? 2 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ECS Cluster for backend services
    this.cluster = new ecs.Cluster(this, 'MindfulBrowseCluster', {
      clusterName: `mindful-browse-cluster-${environment}`,
      vpc: this.vpc,
      containerInsights: true,
    });

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'MindfulBrowseALB', {
      loadBalancerName: `mindful-browse-alb-${environment}`,
      vpc: this.vpc,
      internetFacing: true,
      securityGroup: this.createALBSecurityGroup(),
    });

    // Secrets Manager for configuration
    const apiSecrets = new secretsmanager.Secret(this, 'MindfulBrowseAPISecrets', {
      secretName: `mindful-browse-api-secrets-${environment}`,
      description: 'API keys and configuration for Mindful Browse',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ 
          jwtSecret: '',
          comprehendRegion: this.region,
        }),
        generateStringKey: 'jwtSecret',
        excludeCharacters: '"@/\\',
      },
    });

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, 'MindfulBrowseLambdaRole', {
      roleName: `mindful-browse-lambda-role-${environment}`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem',
              ],
              resources: [this.dataTable.tableArn, `${this.dataTable.tableArn}/index/*`],
            }),
          ],
        }),
        ComprehendAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'comprehend:DetectSentiment',
                'comprehend:ClassifyDocument',
                'comprehend:BatchDetectSentiment',
              ],
              resources: ['*'],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: [`${this.backupBucket.bucketArn}/*`],
            }),
          ],
        }),
        KMSAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'kms:Decrypt',
                'kms:Encrypt',
                'kms:GenerateDataKey',
              ],
              resources: [this.kmsKey.keyArn],
            }),
          ],
        }),
      },
    });

    // Output important values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `mindful-browse-user-pool-id-${environment}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `mindful-browse-user-pool-client-id-${environment}`,
    });

    new cdk.CfnOutput(this, 'DataTableName', {
      value: this.dataTable.tableName,
      description: 'DynamoDB Data Table Name',
      exportName: `mindful-browse-data-table-name-${environment}`,
    });

    new cdk.CfnOutput(this, 'BackupBucketName', {
      value: this.backupBucket.bucketName,
      description: 'S3 Backup Bucket Name',
      exportName: `mindful-browse-backup-bucket-name-${environment}`,
    });

    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS Key ID for encryption',
      exportName: `mindful-browse-kms-key-id-${environment}`,
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
      exportName: `mindful-browse-alb-dns-${environment}`,
    });
  }

  private createALBSecurityGroup(): ec2.SecurityGroup {
    const sg = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Mindful Browse Application Load Balancer',
      allowAllOutbound: true,
    });

    sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );

    return sg;
  }
}