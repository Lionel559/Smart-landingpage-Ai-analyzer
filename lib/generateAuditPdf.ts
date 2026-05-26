import jsPDF from "jspdf";

export type AuditPdfData = {
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
  revenueNotes?: string[];
  consultantFindings?: {
    issue: string;
    evidence: string;
    fix: string;
    impact: string;
    confidence?: number;
  }[];
  quickWins?: {
    headlineFix?: string;
    ctaFix?: string;
    trustFix?: string;
  };
  visualLabels?: string[];
  screenshotUrl?: string;
  createdAt?: string | Date;
  industry?: string | null;
  industryConfidence?: number | null;
  industryReasons?: string[] | null;
};

type PdfColor = [number, number, number];

type Finding = {
  issue: string;
  evidence: string;
  fix: string;
  impact: string;
  confidence?: number;
};

const page = {
  width: 210,
  height: 297,
  margin: 14,
};

const colors = {
  navy: [15, 23, 42] as PdfColor,
  slate: [51, 65, 85] as PdfColor,
  muted: [100, 116, 139] as PdfColor,
  lightText: [226, 232, 240] as PdfColor,
  border: [226, 232, 240] as PdfColor,
  softBlue: [239, 246, 255] as PdfColor,
  blue: [37, 99, 235] as PdfColor,
  indigo: [79, 70, 229] as PdfColor,
  emerald: [16, 185, 129] as PdfColor,
  amber: [245, 158, 11] as PdfColor,
  red: [239, 68, 68] as PdfColor,
  white: [255, 255, 255] as PdfColor,
  pageBg: [248, 250, 252] as PdfColor,
};

function cleanText(value?: string | number) {
  return String(value || "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreTone(score: number): PdfColor {
  const safeScore = clampScore(score);

  if (safeScore >= 80) return colors.emerald;
  if (safeScore >= 65) return colors.blue;
  if (safeScore >= 45) return colors.amber;
  return colors.red;
}

function scoreStatus(score: number) {
  const safeScore = clampScore(score);

  if (safeScore >= 80) return "Strong";
  if (safeScore >= 65) return "Healthy";
  if (safeScore >= 45) return "Needs work";
  return "Critical";
}

function getGeneratedDate(value?: string | Date) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatFileDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDomain(siteUrl: string) {
  const value = cleanText(siteUrl).replace(/^Uploaded screenshot:\s*/i, "");

  try {
    const url = value.match(/^https?:\/\//i) ? value : `https://${value}`;
    return new URL(url).hostname.replace(/^www\./, "") || "website";
  } catch {
    return (
      value
        .replace(/[^a-z0-9.-]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "website"
    );
  }
}

function fileSafeDomain(domain: string) {
  return (
    cleanText(domain)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "website"
  );
}

function leakageRange(auditData: AuditPdfData) {
  const healthGap = Math.max(0, 100 - clampScore(auditData.health));
  const low = Math.min(
    78,
    Math.max(
      8,
      12 + auditData.critical * 5 + auditData.medium * 2 + Math.round(healthGap * 0.16)
    )
  );
  const high = Math.min(
    92,
    Math.max(
      low + 8,
      low + 12 + auditData.critical * 3 + auditData.medium * 2
    )
  );

  return `${low}% to ${high}%`;
}

function priorityRecommendation(auditData: AuditPdfData) {
  const health = clampScore(auditData.health);

  if (auditData.critical > 0 || health < 55) {
    return {
      label: "Immediate CRO repair",
      detail:
        "Resolve the highest-friction messaging, CTA, and trust gaps before scaling traffic.",
    };
  }

  if (health < 70) {
    return {
      label: "High-priority optimization",
      detail:
        "Tighten clarity, proof placement, and action paths around the main conversion zones.",
    };
  }

  if (health < 85) {
    return {
      label: "Conversion polish",
      detail:
        "Improve page polish, mobile clarity, and persuasive detail through focused testing.",
    };
  }

  return {
    label: "Maintain and test",
    detail:
      "Protect the current experience and use controlled experiments for incremental lift.",
  };
}

function fallbackFindings(auditData: AuditPdfData): Finding[] {
  const findings = auditData.findings?.length
    ? auditData.findings
    : ["No major conversion findings were stored for this audit."];

  return findings.map((issue) => ({
    issue,
    evidence: "Stored audit evidence was limited for this item.",
    fix: "Review the page section manually and connect the fix to visible page evidence.",
    impact:
      "Improved clarity can reduce hesitation and move more visitors toward the primary action.",
  }));
}

export const generateAuditPdf = (auditData: AuditPdfData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const generatedDate = getGeneratedDate(auditData.createdAt);
  const generatedAt = formatDisplayDate(generatedDate);
  const domain = getDomain(auditData.siteUrl);
  const priority = priorityRecommendation(auditData);
  const leakage = leakageRange(auditData);
  const contentWidth = page.width - page.margin * 2;
  const contentBottom = page.height - 22;

  const consultantFindings: Finding[] = auditData.consultantFindings?.length
    ? auditData.consultantFindings.map((finding) => ({
        issue: cleanText(finding.issue) || "Conversion issue detected",
        evidence:
          cleanText(finding.evidence) ||
          "Stored audit evidence was limited for this item.",
        fix:
          cleanText(finding.fix) ||
          "Review the page section and connect the recommendation to visible evidence.",
        impact:
          cleanText(finding.impact) ||
          "Improved clarity can reduce hesitation and improve action rate.",
        confidence: finding.confidence,
      }))
    : fallbackFindings(auditData);

  const topRisks = consultantFindings
    .map((finding) => cleanText(finding.issue))
    .filter(Boolean)
    .slice(0, 3);

  const roadmap = auditData.roadmap?.length
    ? auditData.roadmap.map((item) => cleanText(item)).filter(Boolean)
    : [
        "Clarify the primary offer above the fold.",
        "Move the strongest CTA into higher-attention sections.",
        "Add proof close to visitor decision points.",
      ];

  const revenueNotes = auditData.revenueNotes?.length
    ? auditData.revenueNotes.map((item) => cleanText(item)).filter(Boolean)
    : [
        "Conversion leakage is most likely concentrated around first-impression clarity, CTA strength, and trust reinforcement.",
      ];

  let y = page.margin;

  const setFill = (color: PdfColor) => {
    doc.setFillColor(color[0], color[1], color[2]);
  };

  const setDraw = (color: PdfColor) => {
    doc.setDrawColor(color[0], color[1], color[2]);
  };

  const setText = (color: PdfColor) => {
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const getLines = (
    text: string,
    width: number,
    fontSize = 9,
    maxLines?: number
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(cleanText(text), width) as string[];

    if (!maxLines || lines.length <= maxLines) return lines;

    const clipped = lines.slice(0, maxLines);
    clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/\.+$/g, "")}...`;
    return clipped;
  };

  const drawGradientRect = (
    x: number,
    top: number,
    width: number,
    height: number,
    from: PdfColor,
    to: PdfColor,
    steps = 42
  ) => {
    const segmentWidth = width / steps;

    for (let index = 0; index < steps; index += 1) {
      const ratio = index / Math.max(steps - 1, 1);
      const color = from.map((channel, channelIndex) =>
        Math.round(channel + (to[channelIndex] - channel) * ratio)
      ) as PdfColor;

      setFill(color);
      doc.rect(x + segmentWidth * index, top, segmentWidth + 0.2, height, "F");
    }
  };

  const drawLogoMark = (
    x: number,
    top: number,
    size: number,
    fill: PdfColor,
    text: PdfColor
  ) => {
    setFill(fill);
    doc.roundedRect(x, top, size, size, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size > 11 ? 10 : 7);
    setText(text);
    doc.text("PD", x + size / 2, top + size / 2 + 1.5, {
      align: "center",
    });
  };

  const drawRunningHeader = () => {
    drawLogoMark(page.margin, 10, 9, colors.blue, colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setText(colors.navy);
    doc.text("PageDoctor AI", page.margin + 12, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(colors.muted);
    doc.text(domain, page.width - page.margin, 16, { align: "right" });

    setDraw(colors.border);
    doc.setLineWidth(0.25);
    doc.line(page.margin, 22, page.width - page.margin, 22);
  };

  const addContentPage = () => {
    doc.addPage();
    drawRunningHeader();
    y = 34;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= contentBottom) return;
    addContentPage();
  };

  const drawSectionTitle = (eyebrow: string, title: string, copy?: string) => {
    const copyLines = copy ? getLines(copy, contentWidth, 9, 3) : [];
    const titleHeight = copyLines.length ? 24 + copyLines.length * 4.5 : 21;

    ensureSpace(titleHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setText(colors.blue);
    doc.text(cleanText(eyebrow).toUpperCase(), page.margin, y);
    y += 5.5;

    doc.setFontSize(16);
    setText(colors.navy);
    doc.text(cleanText(title), page.margin, y);
    y += 5.5;

    setDraw(colors.border);
    doc.setLineWidth(0.3);
    doc.line(page.margin, y, page.width - page.margin, y);
    y += 5;

    if (copyLines.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(colors.muted);
      doc.text(copyLines, page.margin, y);
      y += copyLines.length * 4.5 + 4;
    } else {
      y += 4;
    }
  };

  const drawParagraph = (
    text: string,
    x: number,
    width: number,
    fontSize = 9,
    lineHeight = 4.7,
    maxLines?: number,
    color: PdfColor = colors.slate
  ) => {
    const lines = getLines(text, width, fontSize, maxLines);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    setText(color);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  const drawMetricCard = (
    x: number,
    top: number,
    width: number,
    height: number,
    label: string,
    value: string,
    accent: PdfColor
  ) => {
    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(x, top, width, height, 4, 4, "FD");

    setFill(accent);
    doc.roundedRect(x, top, 2.6, height, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    setText(colors.muted);
    doc.text(cleanText(label).toUpperCase(), x + 7, top + 7);

    doc.setFontSize(10.5);
    setText(colors.navy);
    const valueLines = getLines(value, width - 11, 10.5, 2);
    doc.text(valueLines, x + 7, top + 15);
  };

  const drawPill = (
    x: number,
    top: number,
    label: string,
    fill: PdfColor,
    text: PdfColor
  ) => {
    const pillWidth = Math.max(22, doc.getTextWidth(cleanText(label)) + 8);
    setFill(fill);
    doc.roundedRect(x, top, pillWidth, 8, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(text);
    doc.text(cleanText(label), x + pillWidth / 2, top + 5.2, {
      align: "center",
    });
  };

  const drawCoverPage = () => {
    setFill(colors.pageBg);
    doc.rect(0, 0, page.width, page.height, "F");
    drawGradientRect(0, 0, page.width, 96, colors.blue, colors.indigo);

    setFill([224, 231, 255]);
    doc.rect(0, 96, page.width, 10, "F");

    drawLogoMark(page.margin, 22, 14, colors.white, colors.blue);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    setText(colors.white);
    doc.text("PageDoctor AI", page.margin + 19, 31);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setText(colors.lightText);
    doc.text("Premium consultant-style landing page audit", page.margin + 19, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(27);
    setText(colors.white);
    doc.text("Conversion Audit Report", page.margin, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setText([219, 234, 254]);
    doc.text("Client-ready PDF export for CRO, SEO, trust, UX, and mobile health.", page.margin, 70);

    const scoreX = page.width - page.margin - 42;
    setFill(colors.white);
    doc.roundedRect(scoreX, 23, 42, 42, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    setText(colors.muted);
    doc.text("OVERALL HEALTH", scoreX + 21, 33, { align: "center" });
    doc.setFontSize(22);
    setText(scoreTone(auditData.health));
    doc.text(`${clampScore(auditData.health)}%`, scoreX + 21, 49, {
      align: "center",
    });
    drawPill(
      scoreX + 9,
      54,
      scoreStatus(auditData.health),
      colors.softBlue,
      colors.blue
    );

    y = 125;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(colors.blue);
    doc.text("AUDITED WEBSITE", page.margin, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    setText(colors.navy);
    const domainLines = getLines(domain, contentWidth, 18, 2);
    doc.text(domainLines, page.margin, y);
    y += domainLines.length * 8 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(colors.muted);
    const urlLines = getLines(auditData.siteUrl, contentWidth, 9, 2);
    doc.text(urlLines, page.margin, y);
    y += urlLines.length * 4.8 + 6;

    if (auditData.industry) {
      drawPill(
        page.margin,
        y,
        `Detected Industry: ${auditData.industry} | ${
          auditData.industryConfidence ?? 0
        }% confidence`,
        colors.softBlue,
        colors.indigo
      );
      y += 13;
    } else {
      y += 6;
    }

    const cardGap = 6;
    const cardWidth = (contentWidth - cardGap * 2) / 3;
    drawMetricCard(
      page.margin,
      y,
      cardWidth,
      28,
      "Generated",
      generatedAt,
      colors.blue
    );
    drawMetricCard(
      page.margin + cardWidth + cardGap,
      y,
      cardWidth,
      28,
      "Consultant confidence",
      `${clampScore(auditData.confidence)}% evidence confidence`,
      colors.indigo
    );
    drawMetricCard(
      page.margin + (cardWidth + cardGap) * 2,
      y,
      cardWidth,
      28,
      "Estimated leakage",
      leakage,
      colors.red
    );
    y += 43;

    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(page.margin, y, contentWidth, 39, 5, 5, "FD");
    setFill(colors.blue);
    doc.roundedRect(page.margin, y, 3, 39, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setText(colors.navy);
    doc.text("Recommended priority", page.margin + 9, y + 10);

    doc.setFontSize(12);
    setText(colors.blue);
    doc.text(priority.label, page.margin + 9, y + 19);

    y += 27;
    drawParagraph(priority.detail, page.margin + 9, contentWidth - 18, 9, 4.5, 2);
  };

  const drawExecutiveSummary = () => {
    drawSectionTitle(
      "Executive Summary",
      "Consultant overview",
      "The audit condenses AI observations into the risks, score signals, and next actions most likely to influence conversion."
    );

    const summary =
      cleanText(auditData.summary) ||
      "PageDoctor AI detected conversion friction across clarity, trust, CTA strength, mobile readiness, and search visibility.";
    const summaryLines = getLines(summary, contentWidth - 16, 10, 8);
    const summaryHeight = Math.max(34, 19 + summaryLines.length * 5);

    ensureSpace(summaryHeight + 8);
    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(page.margin, y, contentWidth, summaryHeight, 5, 5, "FD");
    setFill(colors.softBlue);
    doc.roundedRect(page.margin + 4, y + 4, contentWidth - 8, 9, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(colors.blue);
    doc.text("SHORT AI SUMMARY", page.margin + 9, y + 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setText(colors.slate);
    doc.text(summaryLines, page.margin + 9, y + 21);
    y += summaryHeight + 8;

    const cardGap = 6;
    const cardWidth = (contentWidth - cardGap * 2) / 3;
    ensureSpace(32);
    drawMetricCard(
      page.margin,
      y,
      cardWidth,
      28,
      "Top risks",
      `${Math.max(topRisks.length, 1)} conversion risks`,
      colors.red
    );
    drawMetricCard(
      page.margin + cardWidth + cardGap,
      y,
      cardWidth,
      28,
      "Leakage range",
      leakage,
      colors.amber
    );
    drawMetricCard(
      page.margin + (cardWidth + cardGap) * 2,
      y,
      cardWidth,
      28,
      "Priority",
      priority.label,
      colors.indigo
    );
    y += 38;

    const riskLines = topRisks.length
      ? topRisks
      : ["No major conversion risks were stored for this audit."];
    const lineGroups = riskLines.map((risk) => getLines(risk, contentWidth - 24, 9, 2));
    const riskHeight =
      15 +
      lineGroups.reduce((height, lines) => height + Math.max(9, lines.length * 4.5), 0);

    ensureSpace(riskHeight + 6);
    setFill([248, 250, 252]);
    setDraw(colors.border);
    doc.roundedRect(page.margin, y, contentWidth, riskHeight, 5, 5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(colors.navy);
    doc.text("TOP 3 CONVERSION RISKS", page.margin + 8, y + 9);

    let itemY = y + 18;
    lineGroups.forEach((lines, index) => {
      setFill(colors.white);
      setDraw(colors.border);
      doc.roundedRect(page.margin + 8, itemY - 5.2, 7, 7, 3.5, 3.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setText(colors.blue);
      doc.text(String(index + 1), page.margin + 11.5, itemY - 0.2, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(colors.slate);
      doc.text(lines, page.margin + 20, itemY);
      itemY += Math.max(9, lines.length * 4.5);
    });

    y += riskHeight + 11;
  };

  const drawScoreBreakdown = () => {
    drawSectionTitle(
      "Score Breakdown",
      "Audit health by conversion lever",
      "Each score isolates one area of landing page performance so the next fixes can be prioritized with confidence."
    );

    const scoreCards = [
      ["SEO", auditData.seo, "Search visibility and metadata strength"],
      ["UX", auditData.ux, "Clarity, hierarchy, and friction"],
      ["CTA", auditData.cta, "Action visibility and persuasive force"],
      ["Trust", auditData.trust, "Proof, credibility, and reassurance"],
      ["Mobile", auditData.mobile, "Small-screen clarity and readiness"],
      ["Overall Health", auditData.health, "Composite conversion health"],
    ] as const;

    const gap = 6;
    const cardWidth = (contentWidth - gap) / 2;
    const cardHeight = 34;
    ensureSpace(cardHeight * 3 + gap * 2 + 3);

    scoreCards.forEach(([label, score, note], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = page.margin + column * (cardWidth + gap);
      const top = y + row * (cardHeight + gap);
      const safeScore = clampScore(score);
      const tone = scoreTone(safeScore);

      setFill(colors.white);
      setDraw(colors.border);
      doc.roundedRect(x, top, cardWidth, cardHeight, 5, 5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setText(colors.navy);
      doc.text(label, x + 7, top + 8);

      doc.setFontSize(17);
      setText(tone);
      doc.text(`${safeScore}%`, x + 7, top + 21);

      drawPill(x + cardWidth - 31, top + 6, scoreStatus(safeScore), colors.softBlue, colors.blue);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      setText(colors.muted);
      doc.text(getLines(note, cardWidth - 14, 7.4, 1), x + 7, top + 29);

      setFill([226, 232, 240]);
      doc.roundedRect(x + 7, top + 31, cardWidth - 14, 1.6, 0.8, 0.8, "F");
      setFill(tone);
      doc.roundedRect(
        x + 7,
        top + 31,
        ((cardWidth - 14) * safeScore) / 100,
        1.6,
        0.8,
        0.8,
        "F"
      );
    });

    y += cardHeight * 3 + gap * 2 + 12;
  };

  const drawFindingCard = (finding: Finding, index: number) => {
    const issueLines = getLines(finding.issue, contentWidth - 24, 10, 3);
    const evidenceLines = getLines(finding.evidence, contentWidth - 24, 8.6, 4);
    const fixLines = getLines(finding.fix, contentWidth - 24, 8.6, 4);
    const impactLines = getLines(finding.impact, contentWidth - 24, 8.6, 3);
    const detailHeight =
      evidenceLines.length * 4.3 +
      fixLines.length * 4.3 +
      impactLines.length * 4.3 +
      38;
    const height = Math.max(64, 18 + issueLines.length * 5 + detailHeight);

    ensureSpace(height + 6);

    const top = y;
    const accent = index < Math.max(auditData.critical, 1) ? colors.red : colors.blue;

    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(page.margin, top, contentWidth, height, 5, 5, "FD");

    setFill(accent);
    doc.roundedRect(page.margin, top, 3, height, 2, 2, "F");

    setFill(colors.softBlue);
    doc.roundedRect(page.margin + 8, top + 7, 11, 11, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(colors.blue);
    doc.text(String(index + 1), page.margin + 13.5, top + 14.2, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    setText(colors.muted);
    doc.text("ISSUE", page.margin + 24, top + 10);

    doc.setFontSize(10);
    setText(colors.navy);
    doc.text(issueLines, page.margin + 24, top + 17);

    if (finding.confidence) {
      drawPill(
        page.width - page.margin - 28,
        top + 7,
        `${clampScore(finding.confidence)}% confidence`,
        [236, 253, 245],
        colors.emerald
      );
    }

    let detailY = top + 21 + issueLines.length * 5;

    const drawLabeledBlock = (label: string, lines: string[], accentColor: PdfColor) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      setText(accentColor);
      doc.text(label.toUpperCase(), page.margin + 11, detailY);
      detailY += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.6);
      setText(colors.slate);
      doc.text(lines, page.margin + 11, detailY);
      detailY += lines.length * 4.3 + 5.5;
    };

    drawLabeledBlock("Evidence", evidenceLines, colors.indigo);
    drawLabeledBlock("Recommended fix", fixLines, colors.blue);
    drawLabeledBlock("Expected impact", impactLines, colors.emerald);

    y += height + 6;
  };

  const drawConsultantFindings = () => {
    drawSectionTitle(
      "Consultant Findings",
      "Evidence-based conversion issues",
      "Each finding includes the issue, supporting evidence, recommended fix, and expected business impact."
    );

    consultantFindings.forEach((finding, index) => {
      drawFindingCard(finding, index);
    });
  };

  const drawRoadmap = () => {
    drawSectionTitle(
      "Roadmap",
      "Step-by-step improvement plan",
      "A practical implementation sequence for turning the audit into visible landing page improvements."
    );

    roadmap.forEach((item, index) => {
      const lines = getLines(item, contentWidth - 27, 9.2, 4);
      const height = Math.max(23, 13 + lines.length * 4.7);

      ensureSpace(height + 5);

      setFill(colors.white);
      setDraw(colors.border);
      doc.roundedRect(page.margin, y, contentWidth, height, 5, 5, "FD");

      setFill(colors.softBlue);
      doc.roundedRect(page.margin + 7, y + 7, 10, 10, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setText(colors.blue);
      doc.text(String(index + 1), page.margin + 12, y + 13.6, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      setText(colors.slate);
      doc.text(lines, page.margin + 23, y + 11.5);

      y += height + 5;
    });
  };

  const drawQuickWins = () => {
    const wins = [
      {
        label: "Headline rewrite",
        value:
          cleanText(auditData.quickWins?.headlineFix) ||
          "Lead with the visitor outcome, the audience, and the core differentiator in one clear line.",
      },
      {
        label: "CTA rewrite",
        value:
          cleanText(auditData.quickWins?.ctaFix) ||
          "Use a specific action CTA that tells visitors exactly what they will get next.",
      },
      {
        label: "Trust rewrite",
        value:
          cleanText(auditData.quickWins?.trustFix) ||
          "Place concise proof beside the primary action to reduce hesitation at the decision point.",
      },
    ];

    drawSectionTitle(
      "Quick Wins",
      "Fast copy upgrades",
      "Three rewrite opportunities that can make the page feel clearer, more specific, and easier to trust."
    );

    wins.forEach((win) => {
      const lines = getLines(win.value, contentWidth - 18, 9, 4);
      const height = Math.max(27, 16 + lines.length * 4.6);

      ensureSpace(height + 5);

      setFill([248, 250, 252]);
      setDraw(colors.border);
      doc.roundedRect(page.margin, y, contentWidth, height, 5, 5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setText(colors.indigo);
      doc.text(win.label.toUpperCase(), page.margin + 8, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(colors.slate);
      doc.text(lines, page.margin + 8, y + 18);

      y += height + 5;
    });
  };

  const drawRevenueNotes = () => {
    drawSectionTitle(
      "Revenue Notes",
      "AI conversion interpretation",
      "Commercial notes translate the audit into likely effects on persuasion, lead quality, and revenue capture."
    );

    revenueNotes.forEach((note, index) => {
      const lines = getLines(note, contentWidth - 18, 9, 4);
      const height = Math.max(28, 18 + lines.length * 4.6);

      ensureSpace(height + 5);

      setFill(colors.navy);
      setDraw([30, 41, 59]);
      doc.roundedRect(page.margin, y, contentWidth, height, 5, 5, "FD");

      setFill(colors.emerald);
      doc.roundedRect(page.margin + 7, y + 7, 10, 10, 5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setText(colors.white);
      doc.text(String(index + 1), page.margin + 12, y + 13.5, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(colors.lightText);
      doc.text(lines, page.margin + 23, y + 12);

      y += height + 5;
    });
  };

  const drawVisualAppendix = () => {
    if (!auditData.visualLabels?.length && !auditData.screenshotUrl) return;

    drawSectionTitle(
      "Visual Evidence",
      "Screenshot and AI labels",
      "Supporting visual signals captured during the audit."
    );

    if (auditData.visualLabels?.length) {
      const labels = auditData.visualLabels.slice(0, 10).map((label) => cleanText(label));
      const labelText = labels.join(" | ");
      const lines = getLines(labelText, contentWidth - 16, 8.5, 5);
      const height = Math.max(24, 14 + lines.length * 4.4);

      ensureSpace(height + 5);
      setFill(colors.white);
      setDraw(colors.border);
      doc.roundedRect(page.margin, y, contentWidth, height, 5, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setText(colors.blue);
      doc.text("AI VISUAL LABELS", page.margin + 8, y + 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setText(colors.slate);
      doc.text(lines, page.margin + 8, y + 18);
      y += height + 5;
    }

    if (auditData.screenshotUrl) {
      const lines = getLines(`Screenshot reference: ${auditData.screenshotUrl}`, contentWidth - 16, 8, 4);
      const height = Math.max(23, 13 + lines.length * 4.2);

      ensureSpace(height + 5);
      setFill([248, 250, 252]);
      setDraw(colors.border);
      doc.roundedRect(page.margin, y, contentWidth, height, 5, 5, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setText(colors.muted);
      doc.text(lines, page.margin + 8, y + 10);
      y += height + 5;
    }
  };

  const addFooters = () => {
    const totalPages = doc.getNumberOfPages();

    for (let index = 1; index <= totalPages; index += 1) {
      doc.setPage(index);
      setDraw(colors.border);
      doc.setLineWidth(0.2);
      doc.line(page.margin, 282, page.width - page.margin, 282);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setText(colors.muted);
      doc.text("PageDoctor AI audit report", page.margin, 287);
      doc.text(`${index} / ${totalPages}`, page.width - page.margin, 287, {
        align: "right",
      });
    }
  };

  drawCoverPage();
  addContentPage();
  drawExecutiveSummary();
  drawScoreBreakdown();
  drawConsultantFindings();
  drawRoadmap();
  drawQuickWins();
  drawRevenueNotes();
  drawVisualAppendix();
  addFooters();

  doc.save(
    `pagedoctor-audit-${fileSafeDomain(domain)}-${formatFileDate(generatedDate)}.pdf`
  );
};
