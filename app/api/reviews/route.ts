import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../infrastructure/db/client';

export async function POST(req: NextRequest) {
  try {
    const { id, appointmentId, customerId, rating, comment, date } = await req.json();
    const db = await getDb();
    await db.run(
      `INSERT INTO review (id, appointmentId, customerId, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, appointmentId, customerId, rating, comment ?? null, date],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/reviews]', err);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
