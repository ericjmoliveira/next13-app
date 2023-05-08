import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prisma } from '@/utils/prisma';

export async function GET(request: Request) {
  try {
    const players = await prisma.player.findMany({ orderBy: { name: 'asc' } });

    return new Response(
      JSON.stringify({
        success: true,
        data: { players }
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const schema = z.object({
      name: z
        .string({ required_error: 'Player name is required' })
        .min(3, 'Name must be 3 characters or long'),
      age: z
        .number({ required_error: 'Player age is required' })
        .min(16, 'Player must be at least 16 years old'),
      marketValue: z
        .number({ required_error: 'Player market value is required' })
        .min(1, 'Market value must be at least 1 million')
    });

    const data = schema.parse(body);
    const player = await prisma.player.create({ data });

    return new Response(
      JSON.stringify({
        success: true,
        data: { player },
        message: 'Player added'
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);

      return new Response(
        JSON.stringify({
          success: false,
          error: validationError.details[0].message
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { status: 500 }
    );
  }
}
