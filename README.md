# NovaOps - AI Cloud Incident Commander

NovaOps is a Next.js App Router application that analyzes infrastructure logs with a multi-agent AI pipeline and visualizes incident findings.

## Deploy To Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Framework preset: Next.js.
4. Build command: `next build` (default).
5. Output directory: `.next` (default).

## Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BEDROCK_MODEL_ID` (optional, defaults to Nova Lite)
- `BEDROCK_INFERENCE_PROFILE_ID` (recommended for Nova Lite in regions requiring inference profiles)

You can copy values from `.env.example`.

## Runtime Notes

- The incident analysis API route uses Node.js runtime.
- API timeout is aligned with serverless max duration (`60s`).
- Bedrock calls run only on the server through `app/api/analyze-incident/route.ts`.

## Local Development

```bash
npm install
npm run dev
```

## Security

- Never commit real AWS credentials.
- Rotate any leaked access keys immediately.
- Use IAM least-privilege permissions for Bedrock invocation only.
