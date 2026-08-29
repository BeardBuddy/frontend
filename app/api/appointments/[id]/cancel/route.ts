import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../infrastructure/db/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { cancellationReason } = await req.json();
    const db = await getDb();
    await db.run(
      `UPDATE appointment SET status = 'CANCELLED', cancellationReason = ? WHERE id = ?`,
      [cancellationReason ?? null, id],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/appointments/[id]/cancel]', err);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
