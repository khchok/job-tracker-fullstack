import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class JobTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const httpApi = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: "job-tracker-api",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Cookie", "X-Internal-Secret"],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowOrigins: ["*"],
      },
    });

    const userServiceFn = new lambda.Function(this, "UserServiceFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../apps/user-service/dist"),
      ),
      environment: {
        NODE_ENV: "production",
        JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY!,
        INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET!,
        USER_SERVICE_DATABASE_URL: process.env.USER_SERVICE_DATABASE_URL!,
        SENTRY_DSN: process.env.SENTRY_DSN!,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const jobServiceFn = new lambda.Function(this, "JobServiceFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../apps/job-service/dist"),
      ),
      environment: {
        NODE_ENV: "production",
        JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY!,
        INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET!,
        JOB_SERVICE_DATABASE_URL: process.env.JOB_SERVICE_DATABASE_URL!,
        USER_SERVICE_URL: httpApi.url!,
        SENTRY_DSN: process.env.SENTRY_DSN!,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const userIntegration = new apigatewayv2integrations.HttpLambdaIntegration(
      "UserServiceIntegration",
      userServiceFn,
    );

    const jobIntegration = new apigatewayv2integrations.HttpLambdaIntegration(
      "JobServiceIntegration",
      jobServiceFn,
    );

    httpApi.addRoutes({
      path: "/users/{proxy+}",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: userIntegration,
    });

    httpApi.addRoutes({
      path: "/jobs/{proxy+}",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: jobIntegration,
    });

    httpApi.addRoutes({
      path: "/internal/{proxy+}",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: userIntegration,
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.url!,
      description:
        "API Gateway base URL — use as JOB_SERVICE_URL and USER_SERVICE_URL in Next.js env",
    });
  }
}
