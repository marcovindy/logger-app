// app/test/dashboard-sim/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

const OPERATIONS = [
  "article_create",
  "article_fetch",
  "articles_list",
  "comment_create",
  "comment_save",
  "comments_list"
];

interface OperationStats {
  name: string;
  latency: number;
  errors: number;
  warnings: number;
}

interface OperationStats {
  name: string;
  latency: number;
  errors: number;
  warnings: number;
}

export default function DashboardSimPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, OperationStats>>({});
  const [totalCounts, setTotalCounts] = useState({
    operations: 0,
    errors: 0,
    warnings: 0
  });

  useEffect(() => {
    checkStatus();
    if (isRunning) {
      const interval = setInterval(() => {
        updateStats();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const updateStats = () => {
    setTotalCounts((prev) => ({
      operations: prev.operations + 1,
      errors: Math.random() < 0.1 ? prev.errors + 1 : prev.errors,
      warnings: Math.random() < 0.2 ? prev.warnings + 1 : prev.warnings
    }));

    const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
    setStats((prev) => ({
      ...prev,
      [operation]: {
        name: operation,
        latency: Math.random() * (Math.random() < 0.1 ? 2 : 0.5),
        errors: (prev[operation]?.errors || 0) + (Math.random() < 0.1 ? 1 : 0),
        warnings:
          (prev[operation]?.warnings || 0) + (Math.random() < 0.2 ? 1 : 0)
      }
    }));
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/test/simulate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" })
      });
      const data = await response.json();
      setIsRunning(data.isRunning);
    } catch (error) {
      setError("Failed to check status");
    }
  };

  const handleStart = async () => {
    try {
      const response = await fetch("/api/test/simulate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" })
      });
      const data = await response.json();

      if (data.success) {
        setIsRunning(true);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to start simulation");
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch("/api/test/simulate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      });
      const data = await response.json();

      if (data.success) {
        setIsRunning(false);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to stop simulation");
    }
  };

  const handleReset = () => {
    setStats({});
    setTotalCounts({
      operations: 0,
      errors: 0,
      warnings: 0
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard Simulation Control
      </Typography>

      <Grid container spacing={3} mb={3}>
        <div>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">Operations</Typography>
              </Box>
              <Typography variant="h4">{totalCounts.operations}</Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">Errors</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {totalCounts.errors}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">Warnings</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {totalCounts.warnings}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Operation</TableCell>
              <TableCell align="right">Latency (ms)</TableCell>
              <TableCell align="right">Errors</TableCell>
              <TableCell align="right">Warnings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(stats).map((stat) => (
              <TableRow key={stat.name}>
                <TableCell component="th" scope="row">
                  {stat.name}
                </TableCell>
                <TableCell align="right">
                  {(stat.latency * 1000).toFixed(0)}
                </TableCell>
                <TableCell align="right" sx={{ color: "error.main" }}>
                  {stat.errors}
                </TableCell>
                <TableCell align="right" sx={{ color: "warning.main" }}>
                  {stat.warnings}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" gap={2} my={3}>
        <Button
          variant="contained"
          color={isRunning ? "error" : "primary"}
          onClick={isRunning ? handleStop : handleStart}
        >
          {isRunning ? "Stop Simulation" : "Start Simulation"}
        </Button>
        <Button variant="outlined" onClick={handleReset} disabled={isRunning}>
          Reset Stats
        </Button>
      </Box>

      {isRunning && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={20} />
          <Typography color="primary">
            Generating metrics and logs...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
