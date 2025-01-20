import { useUserStore } from '../store/userStore';
import { supabase } from './supabase';

async function getUserByIdentifier(identifier: string): Promise<{ id: string; email: string }> {
  try {
    let query;
    
    // Check if it's an email
    if (identifier.includes('@')) {
      query = supabase
        .from('profiles')
        .select('id, email')
        .eq('email', identifier.toLowerCase().trim())
        .single();
    } else {
      // It's a CPF
      const cleanCPF = identifier.replace(/\D/g, '');
      query = supabase
        .from('profiles')
        .select('id, email')
        .eq('cpf', cleanCPF)
        .single();
    }

    const { data, error } = await query;
    if (error || !data) {
      throw new Error('Usuário não encontrado');
    }
    return data;
  } catch (error) {
    throw new Error('Usuário não encontrado');
  }
}

export const auth = {
  async login(identifier: string, password: string): Promise<void> {
    try {
      if (!identifier || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      const user = await getUserByIdentifier(identifier);

      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });

      if (error) {
        throw new Error('Senha incorreta');
      }

      if (!data.user) {
        throw new Error('Erro ao autenticar usuário');
      }

      // Get full profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        useUserStore.getState().setProfile({ ...profile, email: user.email });
      } else {
        throw new Error('Perfil não encontrado');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  }
};