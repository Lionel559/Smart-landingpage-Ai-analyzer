import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AuditDataType = {
  siteUrl: string;
  seo: number;
  ux: number;
  cta: number;
  trust: number;
  mobile: number;
  health: number;
  critical: number;
  medium: number;
  minor: number;
  confidence: number;
  findings: string[];
  summary: string;
  roadmap: string[];
};

export const generateAuditPdf = (auditData: AuditDataType) => {
  const doc = new jsPDF();

  // HEADER
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("PageDoctor AI — Conversion Intelligence Report", 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Scanned URL: ${auditData.siteUrl}`, 14, 35);

  // SCORE TABLE
  autoTable(doc, {
    startY: 45,
    head: [["Metric", "Score"]],
    body: [
      ["SEO Intelligence", `${auditData.seo}%`],
      ["UX Clarity", `${auditData.ux}%`],
      ["CTA Persuasion", `${auditData.cta}%`],
      ["Trust Authority", `${auditData.trust}%`],
      ["Mobile Conversion", `${auditData.mobile}%`],
      ["Overall Health", `${auditData.health}%`],
      ["AI Confidence", `${auditData.confidence}%`],
    ],
  });

  let y = (doc as any).lastAutoTable.finalY + 12;

  // ISSUE SEVERITY
  doc.setFontSize(15);
  doc.setTextColor(20);
  doc.text("Issue Severity Matrix", 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(`Critical Revenue Risks: ${auditData.critical}`, 16, y);
  y += 7;
  doc.text(`Medium Friction Points: ${auditData.medium}`, 16, y);
  y += 7;
  doc.text(`Minor Improvements: ${auditData.minor}`, 16, y);
  y += 12;

  // FINDINGS
  doc.setFontSize(15);
  doc.text("AI Findings", 14, y);
  y += 8;

  auditData.findings.forEach((item) => {
    doc.setFontSize(11);
    doc.text(`• ${item.replace(/❌|⚠️|📱/g, "")}`, 18, y);
    y += 7;
  });

  y += 8;

  // SUMMARY
  doc.setFontSize(15);
  doc.text("AI Consultant Summary", 14, y);
  y += 8;

  const summaryLines = doc.splitTextToSize(auditData.summary, 180);
  doc.setFontSize(11);
  doc.text(summaryLines, 18, y);
  y += summaryLines.length * 7 + 10;

  // ROADMAP
  doc.setFontSize(15);
  doc.text("Optimization Roadmap", 14, y);
  y += 8;

  auditData.roadmap.forEach((item, index) => {
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${item}`, 18, y);
    y += 7;
  });

  y += 12;

  // REVENUE IMPACT
  doc.setFontSize(15);
  doc.text("Revenue Opportunity Projection", 14, y);
  y += 8;

  const revenueLift = `+${Math.floor(auditData.health / 4)}% to +${Math.floor(
    auditData.health / 2
  )}%`;

  const monthlyValue = `$${(auditData.health * 70).toLocaleString()} to $${(
    auditData.health * 180
  ).toLocaleString()}`;

  doc.setFontSize(11);
  doc.text(`Estimated Conversion Lift: ${revenueLift}`, 18, y);
  y += 7;
  doc.text(`Estimated Monthly Revenue Opportunity: ${monthlyValue}`, 18, y);

  // SAVE
  doc.save("pagedoctor-ai-report.pdf");
};