export interface IChat {
  conversationId: string;
  message: string;
  type: "TEXT" | "IMAGE"
}