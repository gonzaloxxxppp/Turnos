import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      data: [],
      message: 'Supabase no está configurado.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ configured: true, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ configured: true, data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al obtener perfiles';
    return NextResponse.json({ configured: true, error: message, data: [] }, { status: 500 });
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
    const {
      id,
      email,
      name,
      orgName,
      slug,
      bio = '',
      avatarUrl = '',
      phone = '',
    } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'id, email y name son requeridos.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        name,
        org_name: orgName || name,
        slug: slug || id,
        bio,
        avatar_url: avatarUrl,
        phone,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar perfil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
