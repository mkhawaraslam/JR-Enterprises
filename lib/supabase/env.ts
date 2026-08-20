export function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your project keys.",
    );
  }

  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL looks invalid. Use https://<project-ref>.supabase.co from Data API or Connect — not the dashboard URL, and do not keep the word “your” from the example.",
    );
  }

  return { url: url.replace(/\/$/, ""), anonKey };
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
