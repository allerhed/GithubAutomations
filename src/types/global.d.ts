// Global type declarations for Node.js environment

declare namespace NodeJS {
  interface ProcessEnv {
    APP_VERSION?: string;
    GMAIL_CLIENT_ID?: string;
    GMAIL_CLIENT_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    QUICKBOOKS_COMPANY_ID?: string;
    QUICKBOOKS_CLIENT_ID?: string;
    QUICKBOOKS_CLIENT_SECRET?: string;
    ASANA_API_TOKEN?: string;
    ASANA_WORKSPACE_ID?: string;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;
declare var console: Console;

interface Console {
  log(...args: any[]): void;
  error(...args: any[]): void;
}
