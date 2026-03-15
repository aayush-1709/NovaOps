import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hasRegion = Boolean(process.env.AWS_REGION);
  const hasAccessKeyId = Boolean(process.env.AWS_ACCESS_KEY_ID);
  const hasSecretAccessKey = Boolean(process.env.AWS_SECRET_ACCESS_KEY);
  const hasModelOrProfile = Boolean(
    process.env.BEDROCK_INFERENCE_PROFILE_ID || process.env.BEDROCK_MODEL_ID,
  );

  const bedrockConfigured = hasRegion && hasAccessKeyId && hasSecretAccessKey && hasModelOrProfile;

  return NextResponse.json(
    {
      ok: true,
      service: 'novaops-api',
      timestamp: new Date().toISOString(),
      runtime: 'nodejs',
      bedrock: {
        configured: bedrockConfigured,
        checks: {
          awsRegion: hasRegion,
          awsAccessKeyId: hasAccessKeyId,
          awsSecretAccessKey: hasSecretAccessKey,
          modelOrInferenceProfile: hasModelOrProfile,
        },
      },
    },
    { status: bedrockConfigured ? 200 : 503 },
  );
}
