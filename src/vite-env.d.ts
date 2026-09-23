/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNIN_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
