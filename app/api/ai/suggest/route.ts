import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { existingTasks, projectName } = await req.json();

  const prompt = `You are a project management assistant helping a developer manage their tasks.

Project: "${projectName}"

Existing tasks (do not suggest these again):
${existingTasks.map((t: string) => `- ${t}`).join("\n")}

Suggest 5 NEW tasks that would be valuable for this project. Think about:
- Things commonly forgotten in software projects (testing, documentation, CI/CD, monitoring, error handling)
- Next logical steps based on what already exists
- Technical debt or quality improvements

Respond with ONLY a valid JSON array. No explanation, no markdown, no backticks.
Format: [{"title":"...","priority":"HIGH"|"MEDIUM"|"LOW","tags":["tag1","tag2"]}]`;

  try {
    const completion = await groq.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      messages:   [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? "[]";
    const suggestions = JSON.parse(text);
    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}