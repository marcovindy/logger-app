// src/app/articles/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Article } from "@/types/types";
import { recordMetric } from "@/lib/metrics/client";
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from "@mui/material";
import { Navigation } from "@/components/Navigation";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      const startTime = performance.now();

      try {
        const response = await fetch("/api/articles");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch articles");
        }

        setArticles(data.data);

        // Performance metrika
        await recordMetric("performance", {
          operation: "articles_list_load",
          duration: (performance.now() - startTime) / 1000
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        await recordMetric("error", {
          error_type: "articles_list_error",
          code: "ERROR"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4">Články</Typography>
          <Button
            href="/articles/new"
            variant="contained"
            component={Link}
            sx={{ textDecoration: "none" }}
          >
            Nový článek
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)"
            },
            gap: 3
          }}
        >
          {articles.map((article) => (
            <Paper key={article.id} elevation={0} sx={{ height: "100%" }}>
              <Box
                component={Link}
                href={`/articles/${article.id}`}
                sx={{
                  textDecoration: "none",
                  display: "block",
                  height: "100%"
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  <CardContent>
                    <Chip
                      label={article.category}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {article.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          ))}
        </Box>

        {articles.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              Zatím nejsou žádné články.
            </Typography>
            <Button
              href="/articles/new"
              variant="outlined"
              component={Link}
              sx={{ mt: 2 }}
            >
              Vytvořit první článek
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}
