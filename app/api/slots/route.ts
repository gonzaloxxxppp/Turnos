import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TimeSlot } from '@/types/appointments';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const dateKey = searchParams.get('dateKey');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      data: [],
      message: 'Supabase no está configurado.',
    });
  }

  try {
    let query = supabase.from('slots').select('*');

    if (dateKey) {
      query = query.eq('date_key', dateKey);
    } else if (startDate && endDate) {
      query = query.gte('date_key', startDate).lte('date_key', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
      return NextResponse.json(
        { configured: true, error: error.message, data: [] },
        { status: 500 }
      );
    }

    const slots: (TimeSlot & { dateKey: string })[] = (data || []).map((row) => ({
      id: row.slot_id,
      dateKey: row.date_key,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      clientName: row.client_name || '',
      description: row.description || '',
      category: row.category || '',
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ configured: true, data: slots });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener turnos';
    return NextResponse.json(
      { configured: true, error: message, data: [] },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { configured: false, message: 'Supabase no está configurado.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      dateKey,
      slotId,
      startTime,
      endTime,
      status,
      clientName = '',
      description = '',
      category = '',
    } = body;

    if (!dateKey || !slotId) {
      return NextResponse.json(
        { error: 'dateKey y slotId son requeridos.' },
        { status: 400 }
      );
    }

    const id = `${dateKey}_${slotId}`;
    const updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('slots')
      .upsert({
        id,
        date_key: dateKey,
        slot_id: slotId,
        start_time: startTime || slotId,
        end_time: endTime || slotId,
        status: status || 'disponible',
        client_name: clientName,
        description: description,
        category: category,
        updated_at: updatedAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.slot_id,
        dateKey: data.date_key,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
        clientName: data.client_name,
        description: data.description,
        category: data.category,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar el turno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
