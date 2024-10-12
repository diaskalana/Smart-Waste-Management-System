"use client";
import { Coins } from "lucide-react";
import { saveAs } from "file-saver";

export default function DownloadsPage() {
  function downloadReport(reportName: string) {
    // Simulate a download
    const blob = new Blob([`This is the content of ${reportName}`], {
      type: "application/pdf",
    });
    saveAs(blob, `${reportName}.pdf`);
  }
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Download Reports
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full border-l-4 border-green-500 mb-8">
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Coins className="w-10 h-10 mr-3 text-green-500" />
            <div>
              <span className="text-4xl font-bold text-green-500">blance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300"
          onClick={() => downloadReport("Report 1")}
        >
          Download Report 1
        </button>
        <button className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300">
          Download Report 2
        </button>
        <button className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300">
          Download Report 3
        </button>
        <button className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300">
          Download Report 4
        </button>
      </div>
    </div>
  );
}
