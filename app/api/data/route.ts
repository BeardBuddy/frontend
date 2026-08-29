import { NextResponse } from 'next/server';
import { getDb } from '../../../infrastructure/db/client';

export async function GET() {
  try {
    const db = await getDb();

    const [users, services, barberServices, schedules, appointments, extraServices, reviews, appointmentExtrasRaw] =
      await Promise.all([
        db.all('SELECT * FROM user'),
        db.all('SELECT * FROM service'),
        db.all('SELECT * FROM barber_service'),
        db.all('SELECT * FROM schedule'),
        db.all('SELECT * FROM appointment'),
        db.all('SELECT * FROM extra_service'),
        db.all('SELECT * FROM review'),
        db.all('SELECT * FROM appointment_extra'),
      ]);

    const parsedUsers = users.map((u: Record<string, unknown>) => ({
      ...u,
      certifications:     u.certifications     ? JSON.parse(u.certifications as string)     : [],
      beardCareKnowledge: u.beardCareKnowledge  ? JSON.parse(u.beardCareKnowledge as string) : [],
      managementAccess:   Boolean(u.managementAccess),
      canMentor:          Boolean(u.canMentor),
      scissorsMastery:    u.scissorsMastery  != null ? Boolean(u.scissorsMastery)  : null,
      supportsLongHair:   u.supportsLongHair != null ? Boolean(u.supportsLongHair) : null,
      trimMastery:        u.trimMastery      != null ? Boolean(u.trimMastery)      : null,
      supportsHotTowel:   u.supportsHotTowel != null ? Boolean(u.supportsHotTowel) : null,
    }));

    const parsedServices = services.map((s: Record<string, unknown>) => ({
      ...s,
      subServiceIds: s.subServiceIds ? JSON.parse(s.subServiceIds as string) : [],
      isAvailable:   Boolean(s.isAvailable),
      requiresStyling: s.requiresStyling != null ? Boolean(s.requiresStyling) : null,
    }));

    const appointmentExtras: Record<string, string[]> = {};
    for (const row of appointmentExtrasRaw as { appointmentId: string; extraServiceId: string }[]) {
      if (!appointmentExtras[row.appointmentId]) appointmentExtras[row.appointmentId] = [];
      appointmentExtras[row.appointmentId].push(row.extraServiceId);
    }

    return NextResponse.json({
      users:            parsedUsers,
      services:         parsedServices,
      barberServices,
      schedules,
      appointments,
      extraServices,
      reviews,
      appointmentExtras,
    });
  } catch (err) {
    console.error('[GET /api/data]', err);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
