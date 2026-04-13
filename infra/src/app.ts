import * as cdk from "aws-cdk-lib";
import { JobTrackerStack } from "../lib/job-tracker-stack";

const app = new cdk.App();

new JobTrackerStack(app, "JobTrackerStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
