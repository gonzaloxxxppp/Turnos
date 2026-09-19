import { UserProfile } from '@/types/appointments';
import { 
  loadStoredAccounts, 
  saveStoredAccounts, 
  loadStoredCurrentUser, 
  saveStoredCurrentUser 
} from './storage';
import { supabase } from './supabase/client';

// Preset Avatars for easy user selection when creating/editing profile
export const PRESET_AVATARS = [
  { id: 'av-1', label: 'Dra. Médica / Profesional', url: 'https://images.unsplash.com/photo-1594824813501-48c952b04757?auto=format&fit=crop&w=300&q=80' },
  { id: 'av-2', label: 'Dr. Especialista', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80' },
  { id: 'av-3', label: 'Consultora / Ejecutiva', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { id: 'av-4', label: 'Profesional Ejecutivo', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'av-5', label: 'Estudio Creativo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'av-6', label: 'Salón & Belleza', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
];

const SAMPLE_IDS = new Set([
  'org-estetica-valenzuela',
  'org-odontologia-sonrisas',
  'org-estudio-hakim',
]);

export const authService = {
  /**
   * Obtiene la lista de todas las organizaciones registradas
   * Sin cuentas de muestra: sólo devuelve las cuentas reales creadas por los usuarios
   */
  async getAllOrganizations(): Promise<UserProfile[]> {
    let accounts = loadStoredAccounts();

    // Eliminar cualquier cuenta de muestra que haya quedado en localStorage previamente
    const cleaned = accounts.filter((a) => !SAMPLE_IDS.has(a.id));
    if (cleaned.length !== accounts.length) {
      saveStoredAccounts(cleaned);
      accounts = cleaned;
    }

    // Intentar sincronizar con Supabase si está disponible
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const cloudAccounts: UserProfile[] = data
            .filter((row) => !SAMPLE_IDS.has(row.id))
            .map((row) => ({
              id: row.id,
              email: row.email,
              name: row.name,
              orgName: row.org_name || row.name,
              slug: row.slug || row.id,
              bio: row.bio || '',
              avatarUrl: row.avatar_url || '',
              phone: row.phone || '',
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }));

          const map = new Map<string, UserProfile>();
          accounts.forEach((acc) => map.set(acc.id, acc));
          cloudAccounts.forEach((acc) => map.set(acc.id, acc));
          const merged = Array.from(map.values()).filter((a) => !SAMPLE_IDS.has(a.id));
          saveStoredAccounts(merged);
          return merged;
        }
      } catch (err) {
        console.warn('Usando organizaciones de almacenamiento local:', err);
      }
    }

    return accounts;
  },

  /**
   * Obtiene el usuario autenticado actualmente
   */
  getCurrentUser(): UserProfile | null {
    const user = loadStoredCurrentUser();
    if (user && SAMPLE_IDS.has(user.id)) {
      saveStoredCurrentUser(null);
      return null;
    }
    return user;
  },

  /**
   * Registro de una nueva cuenta con organización
   */
  async signUp(payload: {
    email: string;
    password?: string;
    name: string;
    orgName: string;
    bio?: string;
    avatarUrl?: string;
    phone?: string;
  }): Promise<UserProfile> {
    const slug = payload.orgName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const accountId = `acc-${Date.now()}`;
    const newUser: UserProfile = {
      id: accountId,
      email: payload.email.trim(),
      name: payload.name.trim(),
      orgName: payload.orgName.trim(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      bio: (payload.bio || '').trim(),
      avatarUrl: payload.avatarUrl || PRESET_AVATARS[0].url,
      phone: (payload.phone || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Intentar registrar en Supabase
    if (supabase) {
      try {
        if (payload.password) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
          });
          if (!authError && authData.user) {
            newUser.id = authData.user.id;
          }
        }

        await supabase.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          org_name: newUser.orgName,
          slug: newUser.slug,
          bio: newUser.bio,
          avatar_url: newUser.avatarUrl,
          phone: newUser.phone,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Registro en Supabase opcional; persistiendo localmente:', err);
      }
    }

    // Persistir en cuentas locales y establecer sesión activa
    const accounts = await this.getAllOrganizations();
    const exists = accounts.findIndex((a) => a.id === newUser.id || a.email.toLowerCase() === newUser.email.toLowerCase());
    let updatedAccounts: UserProfile[];
    if (exists >= 0) {
      updatedAccounts = accounts.map((a, i) => (i === exists ? newUser : a));
    } else {
      updatedAccounts = [newUser, ...accounts];
    }

    saveStoredAccounts(updatedAccounts);
    saveStoredCurrentUser(newUser);

    return newUser;
  },

  /**
   * Inicio de sesión
   */
  async signIn(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Intentar inicio de sesión con Supabase Auth si está configurado
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          // Obtener perfil de Supabase
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileRow) {
            const user: UserProfile = {
              id: profileRow.id,
              email: profileRow.email,
              name: profileRow.name,
              orgName: profileRow.org_name || profileRow.name,
              slug: profileRow.slug || profileRow.id,
              bio: profileRow.bio || '',
              avatarUrl: profileRow.avatar_url || '',
              phone: profileRow.phone || '',
              updatedAt: profileRow.updated_at,
            };
            saveStoredCurrentUser(user);
            return user;
          }
        }
      } catch (err) {
        console.warn('Fallback a autenticación local:', err);
      }
    }

    // 2. Fallback de inicio de sesión con cuentas locales
    const accounts = await this.getAllOrganizations();
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (found) {
      saveStoredCurrentUser(found);
      return found;
    }

    throw new Error('No se encontró ninguna cuenta registrada con este correo electrónico.');
  },

  /**
   * Cierre de sesión
   */
  async signOut(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Silencioso
      }
    }
    saveStoredCurrentUser(null);
  },

  /**
   * Actualización del perfil de la cuenta
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getCurrentUser();
    if (!current) {
      throw new Error('No hay sesión iniciada para actualizar el perfil.');
    }

    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar en Supabase
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: updated.id,
          email: updated.email,
          name: updated.name,
          org_name: updated.orgName,
          slug: updated.slug,
          bio: updated.bio,
          avatar_url: updated.avatarUrl,
          phone: updated.phone,
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        console.warn('Error al actualizar en Supabase:', err);
      }
    }

    // Actualizar en localStorage
    saveStoredCurrentUser(updated);
    const accounts = loadStoredAccounts();
    const updatedAccounts = accounts.map((a) => (a.id === updated.id ? updated : a));
    saveStoredAccounts(updatedAccounts);

    return updated;
  },

  /**
   * Obtiene una organización por su ID o slug
   */
  async getOrganization(idOrSlug: string): Promise<UserProfile | null> {
    const accounts = await this.getAllOrganizations();
    return accounts.find((a) => a.id === idOrSlug || a.slug === idOrSlug) || null;
  },
};
