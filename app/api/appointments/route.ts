import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../infrastructure/db/client';

export async function POST(req: NextRequest) {
  const db = await getDb();
    const { id, customerId, barberId, serviceId, date, startTime, endTime, status, paymentStatus, paymentMethod, totalPrice, notes, extraServiceIds } = await req.json();
  try {
    await db.run('BEGIN');
    await db.run(
      `INSERT INTO appointment (id, customerId, barberId, serviceId, date, startTime, endTime, status, paymentStatus, paymentMethod, totalPrice, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, customerId, barberId, serviceId, date, startTime, endTime, status, paymentStatus, paymentMethod, totalPrice, notes ?? null],
    );
    if (Array.isArray(extraServiceIds) && extraServiceIds.length > 0) {
      for (const eid of extraServiceIds) {
        await db.run(
          `INSERT INTO appointment_extra (appointmentId, extraServiceId) VALUES (?, ?)`,
          [id, eid],
        );
      }
    }
    await db.run('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await db.run('ROLLBACK');
    console.error('[POST /api/appointments]', err);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
