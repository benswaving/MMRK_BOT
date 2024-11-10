/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KUCOIN_API_KEY: string
  readonly VITE_KUCOIN_SECRET: string
  readonly VITE_KUCOIN_PASSPHRASE: string
  readonly VITE_KUCOIN_SANDBOX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}