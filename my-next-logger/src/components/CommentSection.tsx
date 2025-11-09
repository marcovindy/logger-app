// src/components/CommentSection.tsx
"use client";

import { useState } from "react";
import { Comment } from "@/types/types";

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  onNewComment: (comment: Comment) => void;
}

export function CommentSection({
  articleId,
  comments,
  onNewComment
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          authorId: "test-user" // V reálu by bylo ze session
        })
      });

      const data = await res.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to add comment");
      }

      setContent("");
      onNewComment(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Chyba při přidání komentáře"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>{comment.content}</p>
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        {error && <div className="error-message">{error}</div>}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Napište komentář..."
          disabled={submitting}
          required
        />
        <button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "Odesílám..." : "Přidat komentář"}
        </button>
      </form>
    </div>
  );
}
