import { AuditDataType } from "@/components/dashboard/DashboardClient";
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  Clock3,
  BrainCircuit,
} from "lucide-react";

type Props = {
  reportHistory: AuditDataType[];
};

export default function RecentReports({ reportHistory }: Props) {
  return (
    <div className="ui-card rounded-[32px] p-8 mt-10">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
          <Database size={18} />
        </div>

        <div>
          <h3 className="text-2xl font-bold">Recent Audit Database</h3>
          <p className="text-sm text-gray-400">
            Stored conversion intelligence reports
          </p>
        </div>
      </div>

      {reportHistory.length === 0 ? (
        <div className="p-10 rounded-[24px] bg-white text-center text-gray-400 border">
          No audit records generated yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reportHistory.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-[24px] border p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition duration-300 hover:shadow-md"
            >
              <div className="flex-1">
                <p className="text-blue-600 font-semibold truncate text-[15px]">
                  {report.siteUrl}
                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span>Health Score: {report.health}%</span>
                  <span>AI Confidence: {report.confidence}%</span>
                  <span>Critical Issues: {report.critical}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center text-sm">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle size={15} />
                  {report.critical} Risks
                </div>

                <div className="flex items-center gap-2 text-blue-500">
                  <BrainCircuit size={15} />
                  AI Completed
                </div>

                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={15} />
                  Stored
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Clock3 size={15} />
                  {report.createdAt
  ? new Date(report.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : "Just now"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}