import { createMocks } from "node-mocks-http";
import { GET } from "@/app/api/reports/download/route"; // Adjust the import based on your file structure
import { jest } from '@jest/globals';

const mockQueryReportData = jest.fn();

jest.mock('@/app/api/reports/download/route', () => ({
  queryReportData: mockQueryReportData,
}));

describe("API /reports/download", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should return a 400 error if no type is provided", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    req.url = "http://localhost:3000/api/reports/download"; 
    const response = await GET(req);
    expect(response.status).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual(expect.objectContaining({
      error: "Report type is required",
    }));
  });

  it("should return data for user_activity report type", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    req.url = "http://localhost:3000/api/reports/download?type=user_activity"; // Mocking the full URL with a valid type

    const response = await GET(req);
    expect(response.status).toBe(200);
    
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toMatch(/attachment; filename=user_activity_report\.pdf/);
  });

  it("should return data for collection_efficiency report type", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    req.url = "http://localhost:3000/api/reports/download?type=collection_efficiency"; // Mocking another valid report type

    const response = await GET(req);
    expect(response.status).toBe(200);
    
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toMatch(/attachment; filename=collection_efficiency_report\.pdf/);
  });

  it("should return a 500 error for an invalid report type", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    req.url = "http://localhost:3000/api/reports/download?type=invalid_type"; // Mocking the full URL with an invalid type
    const response = await GET(req);
    expect(response.status).toBe(500);
  });

});
