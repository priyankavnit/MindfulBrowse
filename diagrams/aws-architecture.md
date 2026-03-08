graph TB
    subgraph "Client Layer"
        USER[End User]
        BE[Browser Extension]
        DASH[Web Dashboard React]
    end

    subgraph "AWS Cloud"
        CF[CloudFront CDN]
        S3[S3 Static Dashboard Hosting]

        APIGW[API Gateway REST API]

        LAMBDA[Lambda Backend Processor]

        BEDROCK[Amazon Bedrock Claude Model]

        DDB[DynamoDB User Activity Table]

        COGNITO[Cognito User Authentication]

        CW[CloudWatch Logs]
    end

    USER --> BE
    USER --> DASH

    DASH --> CF
    CF --> S3

    BE --> APIGW

    APIGW --> LAMBDA

    LAMBDA --> BEDROCK
    LAMBDA --> DDB

    COGNITO --> APIGW

    LAMBDA --> CW