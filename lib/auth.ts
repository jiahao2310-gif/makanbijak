import { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

const DOMAIN = "makanbijak.app";

function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${DOMAIN}`;
}

export async function signIn({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const email = usernameToEmail(username);
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription.unsubscribe;
}
