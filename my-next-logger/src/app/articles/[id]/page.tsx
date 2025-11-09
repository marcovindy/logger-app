// src/app/articles/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CommentSection } from "@/components/CommentSection";
import { ApiResponse, Article, Comment } from "@/types/types";
import { recordMetric } from "@/lib/metrics/client";
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from "@mui/material";
import { Navigation } from "@/components/Navigation";

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articleId = params.id;

  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();

      try {
        const [articleData, commentsData] = await Promise.all([
          fetch(`/api/articles/${articleId}`).then((res) => res.json()),
          fetch(`/api/articles/${articleId}/comments`).then((res) => res.json())
        ]);

        if (!articleData.success || !articleData.data)
          throw new Error(articleData.error || "No article data");

        if (!commentsData.success || !commentsData.data)
          throw new Error(commentsData.error || "No comments data");

        setArticle(articleData.data);
        setComments(commentsData.data);

        await recordMetric("article_view", {
          article_id: articleId,
          category: articleData.data.category
        });

        await recordMetric("performance", {
          operation: "article_load",
          duration: (performance.now() - startTime) / 1000
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        await recordMetric("error", {
          error_type: "article_load_error",
          code: "ERROR",
          path: `/api/articles/${articleId}`,
          article_id: articleId
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [articleId]);

  const handleNewComment = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
  };

  if (loading)
    return (
      <>
        <Navigation />
        <Container>
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );

  if (error)
    return (
      <>
        <Navigation />
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        </Container>
      </>
    );

  if (!article)
    return (
      <>
        <Navigation />
        <Container>
          <Alert severity="info" sx={{ mt: 4 }}>
            Článek nenalezen
          </Alert>
        </Container>
      </>
    );

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" gutterBottom>
            {article.title}
          </Typography>

          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <Chip label={article.category} color="primary" />
            <Typography variant="body2" color="text.secondary">
              Publikováno: {new Date(article.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ mb: 4 }}>
            {article.content}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Komentáře ({comments.length})
          </Typography>

          <CommentSection
            articleId={article.id}
            comments={comments}
            onNewComment={handleNewComment}
          />
        </Paper>
      </Container>
    </>
  );
}
