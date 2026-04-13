import awsLambdaFastify from "@fastify/aws-lambda";
import Fastify from "fastify";
import app, { options } from "./app";

const server = Fastify(options);
server.register(app);
export const handler = awsLambdaFastify(server);