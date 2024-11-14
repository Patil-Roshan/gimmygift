import { supabase } from './supabase';

export async function getToken() {
  const session = await supabase.auth.getSession();
  if (session) {
    const token = session?.data?.session?.access_token;
    return token ?? null;
  } else {
    return null;
  }
}

export async function getUserId() {
  const session = await supabase.auth.getSession();
  if (session) {
    const userId = session?.data?.session?.user?.id;
    return userId ?? null;
  } else {
    return null;
  }
}