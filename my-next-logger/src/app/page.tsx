// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Article } from "@/types/types";
import { Navigation } from "@/components/Navigation";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Paper
} from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/test-data")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error);
        setArticles(data.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Navigation />
    </Box>
  );
}
