"use client";
import ReportDownloadButton from "@/components/ui/ReportDownloadButton";

export default function DownloadsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Download Reports
      </h1>

      {/* User Activity Reports */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          User Activity Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <ReportDownloadButton reportType="user_activity" />
          <ReportDownloadButton reportType="user_engagement_by_date" />
          <ReportDownloadButton reportType="reward_engagement" />
        </div>
      </div>

      {/* Waste Collection Reports */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Waste Collection Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <ReportDownloadButton reportType="collection_efficiency" />
          <ReportDownloadButton reportType="average_waste_per_location" />
          <ReportDownloadButton reportType="waste_type_by_location" />
          <ReportDownloadButton reportType="collector_efficiency" />
        </div>
      </div>
    </div>
  );
}
