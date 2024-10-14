import { Download } from "lucide-react";
import { useState } from "react";

interface ReportDownloadButtonProps {
  reportType: string;
  label: string;
}

const ReportDownloadButton = ({
  reportType,
  label,
}: ReportDownloadButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle report download
  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/reports/download?type=${reportType}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Convert the response to a Blob (binary large object)
      const blob = await response.blob();

      // Create a link element and trigger a download
      const downloadLink = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = `${reportType}_report.pdf`; // Set the filename
      downloadLink.click(); // Trigger the download

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Error downloading report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className={`bg-green-500 text-white p-4 rounded-lg shadow-md w-full h-full flex items-center justify-center transition duration-300 ease-in-out ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
        }`}
        onClick={handleDownload}
        disabled={loading}
      >
        <Download className="w-6 h-6 mr-2" />
        <span className="text-sm font-semibold">
          {loading ? "Generating..." : `Download ${label} Report`}
        </span>
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ReportDownloadButton;
