import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_SCHEDULE_CONFIG } from '@/lib/time-utils';
import { ScheduleConfig } from '@/types/appointments';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId') || 'default';

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      data: DEFAULT_SCHEDULE_CONFIG,
      message: 'Supabase no está configurado en las variables de entorno.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('schedule_config')
      .select('start_hour, end_hour, interval_minutes')
      .eq('id', accountId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching schedule_config:', error);
      return NextResponse.json(
        { configured: true, error: error.message, data: DEFAULT_SCHEDULE_CONFIG },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        configured: true,
        data: DEFAULT_SCHEDULE_CONFIG,
      });
    }

    const config: ScheduleConfig = {
      startHour: data.start_hour,
      endHour: data.end_hour,
      intervalMinutes: [15, 20, 25, 30, 45].includes(data.interval_minutes) ? data.interval_minutes : 15,
      accountId,
    };

    return NextResponse.json({ configured: true, data: config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { configured: true, error: message, data: DEFAULT_SCHEDULE_CONFIG },
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
    const { startHour, endHour, intervalMinutes = 15, accountId = 'default' } = body;

    if (!startHour || !endHour) {
      return NextResponse.json(
        { error: 'startHour y endHour son requeridos.' },
        { status: 400 }
      );
    }

    const validInterval = [15, 20, 25, 30, 45].includes(intervalMinutes) ? intervalMinutes : 15;

    const { data, error } = await supabase
      .from('schedule_config')
      .upsert({
        id: accountId,
        start_hour: startHour,
        end_hour: endHour,
        interval_minutes: validInterval,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        startHour: data.start_hour,
        endHour: data.end_hour,
        intervalMinutes: data.interval_minutes,
        accountId: data.id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la solicitud';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
