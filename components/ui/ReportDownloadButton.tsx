import { Download } from "lucide-react";
import { useState } from "react";

interface ReportDownloadButtonProps {
  reportType: string;
}

const ReportDownloadButton = ({ reportType }: ReportDownloadButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle report download
  const handleDownload = async () => {
    setLoading(true);
    setError(null); // Reset error

    try {
      const response = await fetch(`/api/reports/download?type=${reportType}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${reportType} report`);
      }

      // Convert the response to a Blob and trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `${reportType}_report.pdf`; // Filename for the download
      downloadLink.click();

      // Clean up after download
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setError(`Error downloading ${reportType} report. Please try again.`);
      console.error("Download error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        className={`bg-green-500 text-white p-4 rounded-lg shadow-md w-full h-full flex items-center justify-center transition duration-300 ease-in-out ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
        }`}
        onClick={handleDownload}
        disabled={loading}
      >
        <Download className="w-6 h-6 mr-2" />
        <span className="text-lg font-semibold">
          {loading ? "Generating..." : `Download ${reportType} Report`}
        </span>
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ReportDownloadButton;
