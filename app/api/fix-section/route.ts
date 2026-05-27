import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type FixSectionRequest = {
  label?: unknown;
  url?: unknown;
};

async function getAuthUserId() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/authOptions");

  const session = await getServerSession(authOptions);

  return (session?.user as { id?: string } | undefined)?.id || null;
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | FixSectionRequest
      | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const label =
      typeof body.label === "string" ? body.label.trim() : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (label.length < 3 || label.length > 500) {
      return NextResponse.json(
        { error: "Fix label must be between 3 and 500 characters" },
        { status: 400 }
      );
    }

    if (url.length > 2048) {
      return NextResponse.json(
        { error: "URL context is too long" },
        { status: 400 }
      );
    }

    const prompt = `
You are a CRO conversion expert.

A landing page has this issue:

${JSON.stringify(label)}

Page context:
${url ? JSON.stringify(url) : "No URL context provided."}

Your job:
- Fix ONLY this specific problem
- Be direct, practical, and high-converting

Return JSON:

{
  "fix": "",
  "improvedExample": ""
}
`;

    const completion = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || "{}";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json(JSON.parse(cleaned));
  } catch (err) {
    console.log("FIX AI ERROR:", err);

    return NextResponse.json({
      fix: "Refactor this section with clearer messaging and stronger conversion intent.",
      improvedExample:
        "Start your free trial now and see results in minutes.",
    });
  }
}
