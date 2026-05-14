import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { label, url } = body;

    if (!label) {
      return NextResponse.json(
        { error: "Missing label" },
        { status: 400 }
      );
    }

    const prompt = `
You are a CRO conversion expert.

A landing page has this issue:

"${label}"

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