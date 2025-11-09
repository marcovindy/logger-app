// src/lib/services/spam.ts
import type { CommentRequest } from "@/types/types";

export class SpamService {
  static async checkSpam(comment: CommentRequest): Promise<boolean> {
    // Zde může být skutečná implementace kontroly spamu
    // Pro demo vrátíme false
    return false;
  }
}
