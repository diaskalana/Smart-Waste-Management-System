"use client";
import ReportDownloadButton from "@/components/ui/ReportDownloadButton";
import { useEffect, useState } from "react";

export default function DownloadsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (userEmail) {
        if(userEmail === "maddprojectoreo@gmail.com"){
          setUserRole("staff");
          return;
        }
        setUserRole("user");
        console.log("User Role:", userRole);
      }
    };

    fetchUserRole();
  }, []);

  if (userRole !== "staff") {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-red-600">
          Access Denied: You are not authorized to view this page.
        </h1>
      </div>
    );
  }

  const userActivityReports = [
    { reportType: "user_activity", label: "User Activity" },
    { reportType: "user_engagement_by_date", label: "User Engagement by Date" },
    { reportType: "reward_engagement", label: "Reward Engagement" },
  ];

  const wasteCollectionReports = [
    { reportType: "collection_efficiency", label: "Collection Efficiency" },
    {
      reportType: "average_waste_per_location",
      label: "Average Waste per Location",
    },
    { reportType: "waste_type_by_location", label: "Waste Type by Location" },
    { reportType: "collector_efficiency", label: "Collector Efficiency" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Download Reports
      </h1>

      {/* User Activity Reports */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          User Activity Reports
        </h2>
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
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Waste Collection Reports
        </h2>
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
