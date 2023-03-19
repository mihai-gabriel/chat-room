export interface ChatMessage {
  id?: number;
  text: string;
}

export interface ChatMessageDB {
  id: number;
  authorId: number;
  text: string;
}

export interface FullChatMessage {
  id: number;
  authorName: string;
  text: string;
}
