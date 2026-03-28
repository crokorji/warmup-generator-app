import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { generateWarmupPlan } from '@/lib/generator';

const schema = z.object({
  timeAvailable: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  goal: z.enum(['strength', 'powerlifting', 'hypertrophy', 'fat_loss', 'power', 'endurance', 'sport_specific']),
  sessionFocus: z.enum(['squat', 'hinge', 'lunge', 'push', 'pull', 'bench', 'squat_bench', 'full_body']),
  trainingType: z.string().min(1),
  readiness: z.enum(['low', 'moderate', 'high']),
  pain: z.enum(['none', 'mild', 'moderate']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  notes: z.string().optional(),
  constraints: z
    .object({
      ankleRestriction: z.boolean().optional(),
      hipRestriction: z.boolean().optional(),
      tSpineRestriction: z.boolean().optional(),
      trunkStabilityNeeds: z.boolean().optional(),
      shoulderRestriction: z.boolean().optional()
    })
    .optional()
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const input = schema.parse(json);
    const plan = generateWarmupPlan(input);

    let aiNarrative = '';
    if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: 'gpt-5-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'You are a strength and conditioning coach. Explain the warm-up decisions clearly and practically. Keep the answer concise, specific, and coach-facing. Use the framework Prepare → Position → Access → Integrate → Express. Do not invent injuries or restrictions not present in the payload.'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Warm-up input:\n${JSON.stringify(input, null, 2)}\n\nPlan draft:\n${JSON.stringify(plan, null, 2)}\n\nWrite a short rationale that explains why this structure fits the user, why certain layers were emphasised, and what to watch on the first loaded set.`
              }
            ]
          }
        ]
      });

      aiNarrative = response.output_text;
    }

    return NextResponse.json({ plan, aiNarrative });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to generate warm-up.' }, { status: 400 });
  }
}
