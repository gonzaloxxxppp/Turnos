import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json(
      { configured: false, message: 'Supabase no está configurado.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, color } = body;

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (color) updates.color = color;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('id, name, color')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar categoría';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json(
      { configured: false, message: 'Supabase no está configurado.' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar categoría';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
