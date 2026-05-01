import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not configured in environment variables");
}

const groqClient = new Groq({
  apiKey: GROQ_API_KEY || "",
});

const MODEL = "llama-3.1-8b-instant";
const MAX_TOKENS = 1500;

const SYSTEM_PROMPT = `You are a meeting summarization assistant. Analyze the transcript below where each line starts with the speaker's real username followed by a colon. Produce a structured plain text summary with these sections: Meeting Overview, Key Topics Discussed, Decisions Made, Action Items, Important Highlights, Next Steps. Under each section, when referencing a speaker use their exact username wrapped in double asterisks like **username**. If information is missing write Not mentioned. Do not use markdown, bullets, or special characters except for the username highlighting.`;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateSummaryWithGroq(transcript: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in environment variables");
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error("Transcript is empty");
  }

  console.log("Generating summary with Groq...");
  console.log(`Transcript length: ${transcript.length} characters`);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await groqClient.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
      });

      const summary = response.choices[0]?.message?.content;

      if (!summary) {
        throw new Error("No summary generated from Groq API");
      }

      console.log("Summary generated successfully with Groq");
      return summary;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message;

      console.error(`Groq API error (attempt ${attempt}/3):`, errorMessage);

      const isRetryable =
        errorMessage.includes("429") ||
        errorMessage.includes("503") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("server error");

      if (isRetryable && attempt < 3) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        throw new Error(
          "Invalid or missing Groq API key. Please check your GROQ_API_KEY in .env.local"
        );
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Failed to generate summary after 3 attempts");
}

export async function callGeminiWithTranscript(transcript: string): Promise<string> {
  return generateSummaryWithGroq(transcript);
}
