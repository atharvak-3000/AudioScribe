import { AssemblyAI } from "assemblyai";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

if (!ASSEMBLYAI_API_KEY) {
  console.warn("ASSEMBLYAI_API_KEY is not configured in environment variables");
}

const assemblyClient = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY || "",
});

export interface TranscriptUtterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export async function transcribeWithSpeakerDiarization(
  recordingUrl: string,
  speakersExpected: number
): Promise<TranscriptUtterance[]> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured in environment variables");
  }

  console.log("[AssemblyAI] Starting transcription with speaker diarization...");
  console.log(`[AssemblyAI] Recording URL: ${recordingUrl.substring(0, 100)}...`);
  console.log(`[AssemblyAI] Expected speakers: ${speakersExpected}`);

  try {
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: recordingUrl,
      speaker_labels: true,
      speakers_expected: speakersExpected,
      speech_models: ["universal-2"],
    });

    if (transcript.status === "error") {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    if (!transcript.utterances || transcript.utterances.length === 0) {
      console.warn("[AssemblyAI] No utterances found in transcript");
      return [];
    }

    console.log(`[AssemblyAI] Transcription complete. Found ${transcript.utterances.length} utterances`);

    return transcript.utterances.map((utterance) => ({
      speaker: utterance.speaker || "Unknown",
      text: utterance.text || "",
      start: utterance.start || 0,
      end: utterance.end || 0,
    }));
  } catch (error) {
    console.error("[AssemblyAI] Transcription error:", error);
    throw new Error(
      error instanceof Error
        ? `Transcription failed: ${error.message}`
        : "Failed to transcribe audio with AssemblyAI"
    );
  }
}
