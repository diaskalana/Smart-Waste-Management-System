"use client";
import ReportDownloadButton from "@/components/ui/ReportDownloadButton";

export default function DownloadsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Download Reports
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <ReportDownloadButton reportType="user_activity" />
        <ReportDownloadButton reportType="collection_efficiency" />
        <ReportDownloadButton reportType="reward_engagement" />
      </div>
    </div>
  );
}
