// src/app/articles/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordMetric } from "@/lib/metrics/client";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Paper
} from "@mui/material";
import { Navigation } from "@/components/Navigation";

interface ArticleFormData {
  title: string;
  content: string;
  category: string;
}

const CATEGORIES = ["tech", "news", "lifestyle"];

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    category: CATEGORIES[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create article");
      }

      // Zaznamenání metrik
      await recordMetric("article_create", {
        category: formData.category,
        status: "success"
      });

      await recordMetric("performance", {
        operation: "article_create",
        duration: (performance.now() - startTime) / 1000
      });

      router.push(`/articles/${data.data.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      await recordMetric("error", {
        error_type: "article_create_error",
        code: "ERROR"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Nový článek
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nadpis"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              margin="normal"
            />

            <TextField
              select
              fullWidth
              label="Kategorie"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              margin="normal"
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Obsah"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              multiline
              rows={10}
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Ukládám..." : "Vytvořit článek"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
