import { Info } from "lucide-react";
import {
  confidenceExplanation,
  getConfidenceTier,
} from "@/lib/auditAccuracy";

type Props = {
  confidence: number;
  className?: string;
};

const toneClasses = {
  high: "border-emerald-100 bg-emerald-50 text-emerald-700",
  medium: "border-blue-100 bg-blue-50 text-blue-700",
  low: "border-amber-100 bg-amber-50 text-amber-700",
};

export default function ConfidenceBadge({
  confidence,
  className = "",
}: Props) {
  const tier = getConfidenceTier(confidence);

  return (
    <span
      title={confidenceExplanation}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${toneClasses[tier.tone]} ${className}`}
    >
      <Info size={13} />
      {tier.label}
    </span>
  );
}
