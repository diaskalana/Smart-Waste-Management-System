import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/utils/db/dbConfig";
// import { Users, Reports, Rewards, CollectedWastes } from "@/utils/db/schema";
import puppeteer from "puppeteer";
// import { eq } from "drizzle-orm";

// Helper function to generate HTML content for the PDF
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateHtmlContent = (data: any[], reportType: string) => {
    const tableRows = data
        .map(
            (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${JSON.stringify(item)}</td>
            </tr>
        `
        )
        .join("");

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
              <th>#</th>
              <th>Details</th>
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
    const type = searchParams.get("type"); // Get report type from query params

    console.log("Generating report for type:", type);

    try {
        const data = [
            { name: "John Doe", email: "john@email.com" },
            { name: "Jane Doe", email: "jane@email.com" },
        ];

        // // Query data based on the report type
        // switch (type) {
        //     case "user_activity":
        //         data = await db
        //             .select()
        //             .from(Users)
        //             .leftJoin(Reports, eq(Reports.userId, Users.id));
        //         break;

        //     case "collection_efficiency":
        //         data = await db
        //             .select()
        //             .from(Reports)
        //             .leftJoin(CollectedWastes, eq(CollectedWastes.reportId, Reports.id));
        //         break;

        //     case "reward_engagement":
        //         data = await db
        //             .select()
        //             .from(Rewards)
        //             .leftJoin(Users, eq(Users.id, Rewards.userId));
        //         break;

        //     default:
        //         return NextResponse.json(
        //             { error: "Invalid report type" },
        //             { status: 400 }
        //         );
        // }

        // Generate the HTML content for the PDF
        if (!type) {
            return NextResponse.json(
                { error: "Report type is required" },
                { status: 400 }
            );
        }
        const htmlContent = generateHtmlContent(data, type);

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true, // Keep it true for production
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}



// import { NextRequest, NextResponse } from "next/server";
// import puppeteer from "puppeteer";

// export async function GET(req: NextRequest) {
//     const htmlContent = `
//     <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           h1 { text-align: center; }
//           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//           th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//           th { background-color: #f2f2f2; }
//         </style>
//       </head>
//       <body>
//         <h1>TEST REPORT</h1>
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Name</th>
//               <th>Email</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>1</td>
//               <td>John Doe</td>
//               <td>john@example.com</td>
//             </tr>
//             <tr>
//               <td>2</td>
//               <td>Jane Doe</td>
//               <td>jane@example.com</td>
//             </tr>
//           </tbody>
//         </table>
//       </body>
//     </html>`;

//     try {
//         // Launch Puppeteer
//         const browser = await puppeteer.launch({
//             headless: true,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         });
//         const page = await browser.newPage();

//         // Set the HTML content for the page
//         await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//         // Generate PDF from the HTML content
//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//             margin: {
//                 top: "20px",
//                 bottom: "20px",
//                 left: "20px",
//                 right: "20px",
//             },
//         });

//         await browser.close();

//         // Return the PDF as a stream response
//         return new NextResponse(pdfBuffer, {
//             headers: {
//                 "Content-Type": "application/pdf",
//                 "Content-Disposition": `attachment; filename=test_report.pdf`,
//             },
//         });
//     } catch (error) {
//         console.error("Error generating PDF:", error);
//         return NextResponse.json(
//             { error: "Failed to generate report" },
//             { status: 500 }
//         );
//     }
// }
