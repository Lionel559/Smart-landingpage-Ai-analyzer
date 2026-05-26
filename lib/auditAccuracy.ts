export type ConfidenceTier = {
  label: "High Confidence" | "Medium Confidence" | "Low Confidence";
  tone: "high" | "medium" | "low";
};

export const confidenceExplanation =
  "Confidence reflects how much reliable page data, screenshot evidence, DOM content and AI output consistency supported this audit. It may vary when screenshots are missing, pages block scanners, or page data is incomplete.";

export function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 80) {
    return {
      label: "High Confidence",
      tone: "high",
    };
  }

  if (confidence >= 60) {
    return {
      label: "Medium Confidence",
      tone: "medium",
    };
  }

  return {
    label: "Low Confidence",
    tone: "low",
  };
}

export function getAnalysisModeLabel(mode?: string) {
  if (!mode) return "standard audit";

  return mode.replace(/_/g, " ");
}

export function isScannerFallbackMode(mode?: string) {
  const normalized = (mode || "").toLowerCase();

  return (
    normalized.includes("fallback") ||
    normalized.includes("failed") ||
    normalized.includes("missing")
  );
}
