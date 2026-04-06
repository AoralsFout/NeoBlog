/// <reference types="vite/client" />

// TS 识别环境变量
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// git信息
declare const __GIT_HASH__: string
declare const __GIT_DATE__: string