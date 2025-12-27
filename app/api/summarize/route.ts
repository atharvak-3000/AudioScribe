import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamClient } from '@stream-io/node-sdk';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }

    const { recordingUrl, recordingId, callId } = body;

    if (!recordingUrl) {
      return NextResponse.json(
        { error: 'Recording URL is required' },
        { status: 400 }
      );
    }

    if (!callId) {
      console.warn('No callId provided, summary will not be persisted to the call object.');
    } else {
      // Initialize Stream Client to check/save summary
      const geminiApiKey = process.env.GEMINI_API_KEY;
      const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      const streamApiSecret = process.env.STREAM_SECRET_KEY;

      if (streamApiKey && streamApiSecret) {
        try {
          const streamClient = new StreamClient(streamApiKey, streamApiSecret);
          const call = streamClient.video.call('default', callId);

          // Fetch current call data
          const callData = await call.get();

          // Check if summary already exists
          if (callData.call.custom.summary) {
            console.log('Returning existing summary for call:', callId);
            return NextResponse.json({
              summary: callData.call.custom.summary,
              recordingId,
              timestamp: new Date().toISOString(),
              source: 'existing'
            });
          }
        } catch (streamError) {
          console.error('Error fetching call data:', streamError);
          // Continue to generate summary if fetching failed
        }
      }
    }

    console.log('Starting summarization for recording:', recordingUrl.substring(0, 100));
    const summary = await generateSummary(recordingUrl);

    // Save summary to Stream Call if callId is available
    if (callId) {
      const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      const streamApiSecret = process.env.STREAM_SECRET_KEY;

      if (streamApiKey && streamApiSecret) {
        try {
          const streamClient = new StreamClient(streamApiKey, streamApiSecret);
          const call = streamClient.video.call('default', callId);
          await call.update({
            custom: { summary }
          });
          console.log('Summary saved to call:', callId);
        } catch (saveError) {
          console.error('Failed to save summary to Stream:', saveError);
        }
      }
    }

    return NextResponse.json({
      summary,
      recordingId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/summarize:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to summarize meeting';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

async function generateSummary(recordingUrl: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables. Please add it to your .env.local file.');
  }

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Download the recording file
    console.log('Downloading recording from:', recordingUrl);
    const recordingResponse = await fetch(recordingUrl);

    if (!recordingResponse.ok) {
      throw new Error(`Failed to fetch recording: ${recordingResponse.statusText}`);
    }

    // Get content length to check file size (free tier has limits)
    const contentLength = recordingResponse.headers.get('content-length');
    const fileSizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;

    // Free tier typically supports up to ~20MB for files
    // For larger files, we might need to handle differently
    if (fileSizeInMB > 20) {
      console.warn(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds recommended limit for free tier`);
    }

    // Get the recording as a buffer
    const recordingBuffer = await recordingResponse.arrayBuffer();
    const recordingBase64 = Buffer.from(recordingBuffer).toString('base64');

    // Determine MIME type from response headers or URL extension
    let contentType = recordingResponse.headers.get('content-type');

    // If content type is not available, try to infer from URL
    if (!contentType) {
      if (recordingUrl.includes('.mp4') || recordingUrl.includes('.webm')) {
        contentType = 'video/mp4';
      } else if (recordingUrl.includes('.mp3')) {
        contentType = 'audio/mpeg';
      } else if (recordingUrl.includes('.wav')) {
        contentType = 'audio/wav';
      } else {
        contentType = 'video/mp4'; // Default for Stream recordings
      }
    }

    console.log(`Processing recording with content type: ${contentType}, size: ${fileSizeInMB.toFixed(2)}MB`);

    // List available models first to see what we have access to
    console.log('Fetching available models...');
    let availableModels: string[] = [];
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        availableModels = modelsData.models?.map((m: any) => m.name?.replace('models/', '') || m.name) || [];
        console.log('Available models:', availableModels);
      } else {
        console.warn('Could not fetch model list, will try default models');
      }
    } catch (err) {
      console.warn('Error fetching model list:', err);
    }

    // For free tier, try available models in order of preference
    // Try models that support multimodal content first
    const modelNamesToTry = availableModels.length > 0
      ? availableModels.filter((m: string) => m.includes('gemini'))
      : [
        'gemini-pro',           // Most common free tier model
        'gemini-1.5-pro',       // Newer model
        'gemini-1.5-flash',     // Faster model
        'gemini-1.0-pro',       // Older version
      ];

    if (modelNamesToTry.length === 0) {
      throw new Error('No Gemini models found. Please check your API key and ensure you have access to Gemini models.');
    }

    console.log('Trying models:', modelNamesToTry);

    let model;
    let modelName = modelNamesToTry[0];
    let lastModelError: Error | null = null;

    // Try to find an available model by actually testing API calls
    console.log('Testing models with a simple request...');
    let apiKeyWorks = false;
    for (const name of modelNamesToTry) {
      try {
        modelName = name;
        model = genAI.getGenerativeModel({ model: modelName });

        // Try a simple test to see if the model is accessible
        console.log(`Testing model: ${modelName}`);
        const testResult = await model.generateContent('Hello');
        await testResult.response;
        apiKeyWorks = true;
        console.log(`✓ Model ${modelName} is available and working!`);
        break;
      } catch (err) {
        lastModelError = err instanceof Error ? err : new Error(String(err));
        const errorMsg = lastModelError.message;
        console.log(`✗ Model ${name} failed: ${errorMsg}`);

        // If it's an API key error, stop trying other models
        if (errorMsg.includes('API_KEY') || errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('invalid') || errorMsg.includes('permission')) {
          throw new Error(`Invalid API key or insufficient permissions. Please check your GEMINI_API_KEY in .env.local. Error: ${errorMsg}`);
        }
        continue;
      }
    }

    if (!model || !apiKeyWorks) {
      const errorDetails = lastModelError?.message || 'Unknown error';
      throw new Error(`No available Gemini model found. Tried: ${modelNamesToTry.join(', ')}. Error: ${errorDetails}. Available models from API: ${availableModels.join(', ') || 'none'}. Please verify your API key is correct and you have access to Gemini models. Get your API key from: https://aistudio.google.com/app/apikey`);
    }

    // Create a comprehensive prompt for summarization
    const prompt = `Analyze the following meeting recording and produce a clear, structured summary. Output must be in plain text only. Do not use markdown, symbols, bullets, asterisks, or special characters. Use simple line breaks and section headers exactly as listed.

Required Sections:

Meeting Overview
Provide a short description of the purpose and context of the meeting.

Key Topics Discussed
List the major topics and themes covered during the discussion in clear, concise sentences.

Decisions Made
State all decisions, conclusions, or agreements reached.

Action Items
List all tasks assigned, who is responsible, and any deadlines mentioned.

Important Highlights
Note any crucial insights, issues, concerns, or noteworthy points raised.

Next Steps
State follow-up actions, plans, or upcoming meetings.

Output Rules:

Plain text only. No markdown, symbols, bullets, or decorations.

Keep each section clear and easy to read.

If information is missing, write “Not mentioned”.

Keep wording concise and professional.

Do not add anything that was not in the meeting.`;

    console.log(`Sending to Gemini API (${modelName}) with content type: ${contentType}, size: ${fileSizeInMB.toFixed(2)}MB`);

    // Generate content with the audio/video file
    // Add retry logic for rate limits and model availability (common in free tier)
    let result;
    let retries = 3;
    let lastError: any = null;
    let currentModelIndex = modelNamesToTry.indexOf(modelName);
    if (currentModelIndex === -1) currentModelIndex = 0;

    while (retries > 0) {
      try {
        // If previous attempt failed with model error, try next model
        if (lastError && (lastError?.message?.includes('404') || lastError?.message?.includes('not found') || lastError?.message?.includes('is not found'))) {
          currentModelIndex++;
          if (currentModelIndex < modelNamesToTry.length) {
            modelName = modelNamesToTry[currentModelIndex];
            model = genAI.getGenerativeModel({ model: modelName });
            console.log(`Trying different model: ${modelName}`);
            lastError = null; // Reset error to try again
            retries = 3; // Reset retries for new model
          } else {
            throw new Error(`No available Gemini model found. Tried: ${modelNamesToTry.join(', ')}. Please check your API key and model availability. For free tier, ensure you're using a valid API key from Google AI Studio (https://aistudio.google.com/app/apikey).`);
          }
        }

        result = await model.generateContent([
          {
            inlineData: {
              data: recordingBase64,
              mimeType: contentType || 'video/mp4',
            },
          },
          prompt,
        ]);
        break; // Success, exit retry loop
      } catch (apiError: any) {
        lastError = apiError;
        const errorMessage = apiError?.message || '';

        // Check if it's a model not found error - try next model
        if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('is not found')) {
          currentModelIndex++;
          if (currentModelIndex < modelNamesToTry.length) {
            console.log(`Model ${modelName} not available, trying next model...`);
            retries = 3; // Reset retries for new model
            continue;
          } else {
            throw new Error(`No available Gemini model found. Tried: ${modelNamesToTry.join(', ')}. Please check your API key and model availability. For free tier, ensure you're using a valid API key from Google AI Studio (https://aistudio.google.com/app/apikey).`);
          }
        }

        // Check if it's a rate limit error
        if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          retries--;
          if (retries > 0) {
            const waitTime = (4 - retries) * 2000; // Exponential backoff: 2s, 4s, 6s
            console.log(`Rate limit hit. Retrying in ${waitTime}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error('Rate limit exceeded. Please wait a few minutes and try again. Free tier has usage limits.');
          }
        }
        throw apiError; // Not a rate limit or model error, throw immediately
      }
    }

    if (!result) {
      throw lastError || new Error('Failed to generate content after retries');
    }

    const response = await result.response;
    let summary = response.text();

    if (!summary) {
      throw new Error('No summary generated from Gemini API');
    }

    // Clean up markdown formatting
    summary = summary
      .replace(/\*\*/g, '') // Remove bold asterisks
      .replace(/\*/g, '') // Remove any remaining asterisks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
      .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks
      .trim();

    console.log('Summary generated successfully');
    return summary;
  } catch (error) {
    console.error('Gemini API error:', error);

    // If direct file processing fails, provide a helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an API key issue
    if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('403')) {
      throw new Error('Invalid or missing Gemini API key. Please check your GEMINI_API_KEY in .env.local');
    }

    // Check for rate limits
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      throw new Error('Rate limit exceeded. Free tier has usage limits. Please wait a few minutes and try again.');
    }

    // Check if it's a file format issue
    if (errorMessage.includes('format') || errorMessage.includes('mimeType') || errorMessage.includes('Invalid')) {
      throw new Error('Unsupported recording format. Please ensure the recording is in a supported audio/video format (MP3, MP4, WAV, etc.).');
    }

    // Check for file size issues
    if (errorMessage.includes('size') || errorMessage.includes('too large')) {
      throw new Error('Recording file is too large. Free tier supports files up to ~20MB. Please use a shorter recording or upgrade your plan.');
    }

    throw new Error(`Failed to generate summary: ${errorMessage}`);
  }
}

