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
    user_engagement_by_date: "<th>#</th><th>Date</th><th>Report Count</th>",
    average_waste_per_location:
      "<th>#</th><th>Location</th><th>Average Waste</th>",
    waste_type_by_location:
      "<th>#</th><th>Location</th><th>Waste Type</th><th>Report Count</th>",
    collector_efficiency:
      "<th>#</th><th>Collector ID</th><th>Collected Reports</th>",
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

    case "user_engagement_by_date":
      return db
        .select({
          date: sql<Date>`DATE(${Reports.createdAt})`.as("date"),
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(sql`DATE(${Reports.createdAt})`);

    case "average_waste_per_location":
      return db
        .select({
          location: Reports.location,
          averageWaste:
            sql<number>`AVG(CAST(REGEXP_REPLACE(${Reports.amount}, '[^0-9.]+', '', 'g') AS FLOAT))`.as(
              "averageWaste"
            ),
        })
        .from(Reports)
        .groupBy(Reports.location);

    case "waste_type_by_location":
      return db
        .select({
          location: Reports.location,
          wasteType: Reports.wasteType,
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(Reports.location, Reports.wasteType);

    case "collector_efficiency":
      return db
        .select({
          collectorId: CollectedWastes.collectorId,
          collectedReports: sql<number>`COUNT(${CollectedWastes.reportId})`.as(
            "collectedReports"
          ),
        })
        .from(CollectedWastes)
        .groupBy(CollectedWastes.collectorId);

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
        canvas { margin: 40px auto; display: block; }
      </style>
    </head>
    <body>
      <h1>${reportType.toUpperCase()} REPORT</h1>
      <canvas id="chart"></canvas> <!-- Chart goes here -->
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
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const ctx = document.getElementById('chart').getContext('2d');
        const chartData = {
          labels: ${JSON.stringify(
            data.map((item) => item.location || item.wasteType)
          )}, 
          datasets: [{
            label: '${reportType} Data',
            data: ${JSON.stringify(
              data.map(
                (item) =>
                  item.reportCount || item.totalAmount || item.collectedReports
              )
            )},
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };

        new Chart(ctx, {
          type: 'bar', // You can change this to 'line', 'pie', etc.
          data: chartData,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      </script>
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


    const data = await queryReportData(type);
    console.log(`${type} Data:`, data);

    const htmlContent = generateHtmlContent(data, type);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set the HTML content for the page
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

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


export {queryReportData, getTableHeaders, generateHtmlContent};