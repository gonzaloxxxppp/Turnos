import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TimeSlot } from '@/types/appointments';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const dateKey = searchParams.get('dateKey');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const accountId = searchParams.get('accountId') || 'default';

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      data: [],
      message: 'Supabase no está configurado.',
    });
  }

  try {
    let query = supabase.from('slots').select('*');

    // Intentar filtrar por account_id
    query = query.eq('account_id', accountId);

    if (dateKey) {
      query = query.eq('date_key', dateKey);
    } else if (startDate && endDate) {
      query = query.gte('date_key', startDate).lte('date_key', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      // Si la columna account_id no existe aún en la tabla remota, intentar sin account_id
      if (error.message.includes('account_id')) {
        let fallbackQuery = supabase.from('slots').select('*');
        if (dateKey) fallbackQuery = fallbackQuery.eq('date_key', dateKey);
        else if (startDate && endDate) fallbackQuery = fallbackQuery.gte('date_key', startDate).lte('date_key', endDate);
        const fbResult = await fallbackQuery.order('start_time', { ascending: true });
        if (!fbResult.error) {
          const fbSlots = (fbResult.data || []).map((row) => ({
            id: row.slot_id,
            accountId: row.account_id || accountId,
            dateKey: row.date_key,
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.status,
            clientName: row.client_name || '',
            clientPhone: row.client_phone || '',
            description: row.description || '',
            category: row.category || '',
            updatedAt: row.updated_at,
          }));
          return NextResponse.json({ configured: true, data: fbSlots });
        }
      }

      console.error('Error fetching slots:', error);
      return NextResponse.json(
        { configured: true, error: error.message, data: [] },
        { status: 500 }
      );
    }

    const slots: (TimeSlot & { dateKey: string })[] = (data || []).map((row) => ({
      id: row.slot_id,
      accountId: row.account_id || accountId,
      dateKey: row.date_key,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      clientName: row.client_name || '',
      clientPhone: row.client_phone || '',
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
      accountId = 'default',
      dateKey,
      slotId,
      startTime,
      endTime,
      status,
      clientName = '',
      clientPhone = '',
      description = '',
      category = '',
    } = body;

    if (!dateKey || !slotId) {
      return NextResponse.json(
        { error: 'dateKey y slotId son requeridos.' },
        { status: 400 }
      );
    }

    const id = `${accountId}_${dateKey}_${slotId}`;
    const updatedAt = new Date().toISOString();

    const payload: Record<string, unknown> = {
      id,
      account_id: accountId,
      date_key: dateKey,
      slot_id: slotId,
      start_time: startTime || slotId,
      end_time: endTime || slotId,
      status: status || 'disponible',
      client_name: clientName,
      client_phone: clientPhone,
      description: description,
      category: category,
      updated_at: updatedAt,
    };

    let { data, error } = await supabase
      .from('slots')
      .upsert(payload)
      .select()
      .single();

    // Fallback si la columna account_id o client_phone no existen en DB remota
    if (error && (error.message.includes('account_id') || error.message.includes('client_phone'))) {
      const fallbackPayload = {
        id: `${dateKey}_${slotId}`,
        date_key: dateKey,
        slot_id: slotId,
        start_time: startTime || slotId,
        end_time: endTime || slotId,
        status: status || 'disponible',
        client_name: clientName,
        description: description,
        category: category,
        updated_at: updatedAt,
      };
      const fallbackRes = await supabase
        .from('slots')
        .upsert(fallbackPayload)
        .select()
        .single();

      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.slot_id,
        accountId: data.account_id || accountId,
        dateKey: data.date_key,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
        clientName: data.client_name,
        clientPhone: data.client_phone || clientPhone,
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
