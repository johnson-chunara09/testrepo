export interface AuthResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface DocumentMeta {
  id: number;
  filename: string;
  chunkCount: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ChatMessage {
  from: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

export interface UserSummary {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}
