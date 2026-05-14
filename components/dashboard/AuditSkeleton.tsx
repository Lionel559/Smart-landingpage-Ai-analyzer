export default function AuditSkeleton() {
  return (
    <div className="mt-8 space-y-6 animate-pulse">
      {/* TOP GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="h-[320px] rounded-[34px] bg-gray-200"></div>

        <div className="h-[320px] rounded-[34px] bg-gray-200"></div>

        <div className="h-[320px] rounded-[34px] bg-gray-200"></div>
      </div>

      {/* REWRITE */}
      <div className="h-[420px] rounded-[34px] bg-gray-200"></div>

      {/* RESULTS */}
      <div className="space-y-4">
        <div className="h-[120px] rounded-[28px] bg-gray-200"></div>
        <div className="h-[120px] rounded-[28px] bg-gray-200"></div>
        <div className="h-[120px] rounded-[28px] bg-gray-200"></div>
      </div>
    </div>
  );
}