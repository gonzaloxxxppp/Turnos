import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const { dateKey, slotId } = body;

    if (!dateKey) {
      return NextResponse.json(
        { error: 'dateKey es obligatorio.' },
        { status: 400 }
      );
    }

    const updatedAt = new Date().toISOString();

    if (slotId) {
      // Restablecer un turno individual a 'disponible'
      const { data, error } = await supabase
        .from('slots')
        .update({
          status: 'disponible',
          client_name: '',
          description: '',
          updated_at: updatedAt,
        })
        .match({ date_key: dateKey, slot_id: slotId })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Restablecer todos los turnos de ese día
      const { error } = await supabase
        .from('slots')
        .update({
          status: 'disponible',
          client_name: '',
          description: '',
          updated_at: updatedAt,
        })
        .eq('date_key', dateKey);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Día ${dateKey} restablecido.` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al restablecer turno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
