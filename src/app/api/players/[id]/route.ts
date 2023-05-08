import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prisma } from '@/utils/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const player = await prisma.player.findFirst({ where: { id } });

    if (!player) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Player not found'
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { player }
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const playerExists = await prisma.player.findFirst({ where: { id } });

    if (!playerExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Player not found'
        }),
        { status: 404 }
      );
    }

    const body = await request.json();
    const schema = z
      .object({
        name: z
          .string({ required_error: 'Player name is required' })
          .min(3, 'Name must be 3 characters or long'),
        age: z
          .number({ required_error: 'Player age is required' })
          .min(16, 'Player must be at least 16 years old'),
        marketValue: z
          .number({ required_error: 'Player market value is required' })
          .min(1, 'Player market value must be at least 1 million')
      })
      .partial()
      .refine((data) => data.name || data.age || data.marketValue, {
        message: 'At least one field must be provided'
      });

    const data = schema.parse(body);
    const player = await prisma.player.update({ where: { id }, data });

    return new Response(
      JSON.stringify({
        success: true,
        data: { player },
        message: 'Player updated'
      }),
      { status: 200 }
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const playerExists = await prisma.player.findFirst({ where: { id } });

    if (!playerExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Player not found'
        }),
        { status: 404 }
      );
    }

    await prisma.player.delete({ where: { id } });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Player removed'
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
