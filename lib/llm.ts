import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const DEFAULT_MODEL_ID = 'amazon.nova-lite-v1:0';
const DEFAULT_REGION = process.env.AWS_REGION ?? 'us-east-1';
const LLM_TIMEOUT_MS = 30_000;

let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient() {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: DEFAULT_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }

  return bedrockClient;
}

function extractNovaText(responseBody: string): string {
  try {
    const parsed = JSON.parse(responseBody) as {
      output?: {
        message?: {
          content?: Array<{ text?: string }>;
        };
      };
      results?: Array<{
        outputText?: string;
      }>;
    };

    const messageText = parsed.output?.message?.content?.[0]?.text;
    if (messageText && messageText.trim()) return messageText.trim();

    const fallbackText = parsed.results?.[0]?.outputText;
    if (fallbackText && fallbackText.trim()) return fallbackText.trim();
  } catch {
    // If the model response is not JSON, return raw text.
  }

  return responseBody.trim();
}

export async function callLLM(prompt: string): Promise<string> {
  if (!prompt.trim()) {
    throw new Error('Prompt cannot be empty.');
  }

  const modelId = process.env.BEDROCK_MODEL_ID ?? DEFAULT_MODEL_ID;
  const client = getBedrockClient();

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        max_new_tokens: 800,
        temperature: 0,
        top_p: 0.9,
      },
    }),
  });

  try {
    const response = await Promise.race([
      client.send(command),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM request timed out.')), LLM_TIMEOUT_MS),
      ),
    ]);
    const decoded = new TextDecoder().decode(response.body);
    const text = extractNovaText(decoded);

    if (!text) {
      throw new Error('LLM returned an empty response.');
    }

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown LLM error';
    throw new Error(`Bedrock call failed: ${message}`);
  }
}
