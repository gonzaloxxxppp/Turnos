import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface BulkSlotInput {
  dateKey: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'disponible' | 'ocupado' | 'deshabilitado';
  clientName?: string;
  clientPhone?: string;
  description?: string;
  category?: string;
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { configured: false, message: 'Supabase no está configurado.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { slots, accountId = 'default' }: { slots: BulkSlotInput[]; accountId?: string } = body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una lista de turnos (slots) válida.' },
        { status: 400 }
      );
    }

    const updatedAt = new Date().toISOString();
    const rows = slots.map((s) => ({
      id: `${accountId}_${s.dateKey}_${s.slotId}`,
      account_id: accountId,
      date_key: s.dateKey,
      slot_id: s.slotId,
      start_time: s.startTime,
      end_time: s.endTime,
      status: s.status,
      client_name: s.clientName || '',
      client_phone: s.clientPhone || '',
      description: s.description || '',
      category: s.category || '',
      updated_at: updatedAt,
    }));

    let { error } = await supabase
      .from('slots')
      .upsert(rows);

    if (error && (error.message.includes('account_id') || error.message.includes('client_phone'))) {
      const fallbackRows = slots.map((s) => ({
        id: `${s.dateKey}_${s.slotId}`,
        date_key: s.dateKey,
        slot_id: s.slotId,
        start_time: s.startTime,
        end_time: s.endTime,
        status: s.status,
        client_name: s.clientName || '',
        description: s.description || '',
        category: s.category || '',
        updated_at: updatedAt,
      }));
      const fallbackRes = await supabase.from('slots').upsert(fallbackRows);
      error = fallbackRes.error;
    }

    if (error) {
      console.error('Error in bulk upsert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      message: `${rows.length} turnos actualizados exitosamente.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en operación por lotes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
