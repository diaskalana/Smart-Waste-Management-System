import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db/dbConfig";
import { Reports, CollectedWastes } from "@/utils/db/schema";
import puppeteer from "puppeteer";
import { eq, sql } from "drizzle-orm";

// Helper function to build table headers based on the report type
const getTableHeaders = (reportType: string) => {
  const headersMap: { [key: string]: string } = {
    user_activity: "<th>#</th><th>Location</th><th>Report Count</th>",
    collection_efficiency:
      "<th>#</th><th>Total Reports</th><th>Collected Reports</th>",
    reward_engagement: "<th>#</th><th>Waste Type</th><th>Total Amount</th>",
  };
  return headersMap[reportType] || "";
};

// Helper function to query the database based on report type
const queryReportData = async (type: string) => {
  switch (type) {
    case "user_activity":
      return db
        .select({
          location: Reports.location,
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(Reports.location);

    case "collection_efficiency":
      return db
        .select({
          totalReports: sql<number>`COUNT(DISTINCT ${Reports.id})`.as(
            "totalReports"
          ),
          collectedReports: sql<number>`COUNT(${CollectedWastes.reportId})`.as(
            "collectedReports"
          ),
        })
        .from(Reports)
        .leftJoin(CollectedWastes, eq(CollectedWastes.reportId, Reports.id));

    case "reward_engagement":
      return db
        .select({
          wasteType: Reports.wasteType,
          totalAmount: sql<number>`
              SUM(CAST(REGEXP_REPLACE(${Reports.amount}, '[^0-9.]+', '', 'g') AS FLOAT))
            `.as("totalAmount"),
        })
        .from(Reports)
        .groupBy(Reports.wasteType);

    default:
      throw new Error("Invalid report type");
  }
};

// Helper function to generate HTML content for the PDF
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateHtmlContent = (data: any[], reportType: string) => {
  const tableRows = data
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        ${Object.values(item)
          .map((value) => `<td>${value}</td>`)
          .join("")}
      </tr>`
    )
    .join("");

  const headers = getTableHeaders(reportType);

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${reportType.toUpperCase()} REPORT</h1>
        <table>
          <thead>
            <tr>
              ${headers}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

// API handler function
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (!type) {
      return NextResponse.json(
        { error: "Report type is required" },
        { status: 400 }
      );
    }

    // Query data based on the report type
    const data = await queryReportData(type);
    console.log(`${type} Data:`, data);

    // Generate the HTML content for the PDF
    const htmlContent = generateHtmlContent(data, type);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set the HTML content for the page
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF from the HTML content
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    // Return the PDF as a stream response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${type}_report.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
