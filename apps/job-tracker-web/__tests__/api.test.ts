import fetchMock from "jest-fetch-mock";
import { getJobs, createJob, updateJob, deleteJob } from "@/lib/api";
import { JobStatus } from "shared-types";

beforeEach(() => fetchMock.resetMocks());

const mockJob = { id: 1, name: "Engineer at Acme", status: JobStatus.NEW, remarks: "" };

describe("getJobs", () => {
  it("fetches and returns jobs array", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([mockJob]));
    const result = await getJobs();
    expect(result).toEqual([mockJob]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs");
  });

  it("throws on non-ok response", async () => {
    fetchMock.mockResponseOnce("", { status: 500 });
    await expect(getJobs()).rejects.toThrow("Failed to fetch jobs");
  });
});

describe("createJob", () => {
  it("POSTs and returns the created job", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockJob), { status: 201 });
    const result = await createJob({ name: "Engineer at Acme", remarks: "" });
    expect(result).toEqual(mockJob);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Engineer at Acme", remarks: "" }),
    });
  });
});

describe("updateJob", () => {
  it("PUTs partial data and returns updated job", async () => {
    const updated = { ...mockJob, status: JobStatus.PENDING_INTERVIEW };
    fetchMock.mockResponseOnce(JSON.stringify(updated));
    const result = await updateJob(1, { status: JobStatus.PENDING_INTERVIEW });
    expect(result).toEqual(updated);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: JobStatus.PENDING_INTERVIEW }),
    });
  });
});

describe("deleteJob", () => {
  it("sends DELETE request", async () => {
    fetchMock.mockResponseOnce("", { status: 204 });
    await deleteJob(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs/1", {
      method: "DELETE",
    });
  });
});
