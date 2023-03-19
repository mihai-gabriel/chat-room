export interface ChatMessage {
  id?: number;
  text: string;
}

// TODO: Needs refactoring
export interface FullChatMessage {
  id: number;
  authorName: string;
  text: string;
}
