import { FastifyInstance } from "fastify";
import { Job, JobStatus } from "shared-types";
import * as jobService from "../../services/job.service";

const JOB_STATUSES = Object.values(JobStatus);

const jobSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    status: { type: "string", enum: JOB_STATUSES },
    remarks: { type: "string" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get("/health", async (_request, reply) => {
    return reply.status(200).send({ message: "OK" });
  });

  fastify.get(
    "/",
    {
      schema: {
        description: "Returns all jobs",
        tags: ["Jobs"],
        response: { 200: { type: "array", items: jobSchema } },
      },
      // @ts-ignore
      onRequest: [fastify.authenticate],
    },
    async () => jobService.getAll(),
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Returns a job by ID",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        response: {
          200: jobSchema,
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const job = jobService.getById(id);
      if (!job) return reply.status(404).send({ error: "Job not found" });
      return job;
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        description: "Creates a new job with status NEW",
        tags: ["Jobs"],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            remarks: { type: "string", default: "" },
          },
        },
        response: { 201: jobSchema },
      },
    },
    async (request, reply) => {
      const { name, remarks = "" } = request.body as {
        name: string;
        remarks?: string;
      };
      const job = jobService.createJob(name, remarks);
      return reply.status(201).send(job);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        description: "Partially updates a job's name, status, and/or remarks",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string", enum: JOB_STATUSES },
            remarks: { type: "string" },
          },
        },
        response: {
          200: jobSchema,
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const data = request.body as Partial<
        Pick<Job, "name" | "status" | "remarks">
      >;
      const job = jobService.updateJob(id, data);
      if (!job) return reply.status(404).send({ error: "Job not found" });
      return job;
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Deletes a job by ID",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        response: {
          204: { type: "null" },
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const deleted = jobService.deleteJob(id);
      if (!deleted) return reply.status(404).send({ error: "Job not found" });
      return reply.status(204).send();
    },
  );
}
