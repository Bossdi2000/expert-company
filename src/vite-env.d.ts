/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_RESEND_API_KEY: string
  readonly VITE_ADMIN_NOTIFY_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
