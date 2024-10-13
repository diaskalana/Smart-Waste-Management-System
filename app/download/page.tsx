"use client";
import ReportDownloadButton from "@/components/ui/ReportDownloadButton";

export default function DownloadsPage() {
  const userActivityReports = [
    { reportType: "user_activity", label: "User Activity" },
    { reportType: "user_engagement_by_date", label: "User Engagement by Date" },
    { reportType: "reward_engagement", label: "Reward Engagement" },
  ];

  const wasteCollectionReports = [
    { reportType: "collection_efficiency", label: "Collection Efficiency" },
    { reportType: "average_waste_per_location", label: "Average Waste per Location" },
    { reportType: "waste_type_by_location", label: "Waste Type by Location" },
    { reportType: "collector_efficiency", label: "Collector Efficiency" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Download Reports</h1>

      {/* User Activity Reports */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Activity Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {userActivityReports.map((report) => (
            <ReportDownloadButton
              key={report.reportType}
              reportType={report.reportType}
              label={report.label}
            />
          ))}
        </div>
      </div>

      {/* Waste Collection Reports */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Waste Collection Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {wasteCollectionReports.map((report) => (
            <ReportDownloadButton
              key={report.reportType}
              reportType={report.reportType}
              label={report.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
