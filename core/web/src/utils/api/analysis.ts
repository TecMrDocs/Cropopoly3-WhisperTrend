import { get, post } from '../methods';

export interface ChatRequest { 
  model: string; 
}

export type ChatResponse = string;

export default {
  analysis: {
    analyze: (model: string): Promise<ChatResponse> =>
      post<ChatResponse, ChatRequest>('analysis', { model }, true),
    
    getDummy: (): Promise<ChatResponse> =>
      get<ChatResponse>('analysis/dummy', true),
  },
};