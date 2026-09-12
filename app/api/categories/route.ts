import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import { CategoryItem } from '@/types/appointments';

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      data: DEFAULT_CATEGORIES,
      message: 'Supabase no está configurado.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { configured: true, error: error.message, data: DEFAULT_CATEGORIES },
        { status: 500 }
      );
    }

    const categories: CategoryItem[] = (data || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
    }));

    return NextResponse.json({
      configured: true,
      data: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener categorías';
    return NextResponse.json(
      { configured: true, error: message, data: DEFAULT_CATEGORIES },
      { status: 500 }
    );
  }
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
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'El nombre y el color de la categoría son obligatorios.' },
        { status: 400 }
      );
    }

    const id = body.id || `cat-${Date.now()}`;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        name,
        color,
        created_at: new Date().toISOString(),
      })
      .select('id, name, color')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        color: data.color,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear categoría';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
