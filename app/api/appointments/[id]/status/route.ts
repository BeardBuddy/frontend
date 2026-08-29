import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../infrastructure/db/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const db = await getDb();
    await db.run(`UPDATE appointment SET status = ? WHERE id = ?`, [status, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/appointments/[id]/status]', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
