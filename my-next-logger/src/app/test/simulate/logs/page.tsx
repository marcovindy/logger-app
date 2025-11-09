// app/test/simulate/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from "@mui/material";

export default function SimulatePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/test/simulate-logs", {
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

  useEffect(() => {
    checkStatus();
  }, []);

  const handleStart = async () => {
    try {
      const response = await fetch("/api/test/simulate-logs", {
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
      const response = await fetch("/api/test/simulate-logs", {
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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Log Simulation Control
      </Typography>

      <Box display="flex" gap={2} my={3}>
        <Button
          variant="contained"
          color={isRunning ? "error" : "primary"}
          onClick={isRunning ? handleStop : handleStart}
        >
          {isRunning ? "Stop Simulation" : "Start Simulation"}
        </Button>
      </Box>

      {isRunning && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={20} />
          <Typography color="primary">Simulation is running...</Typography>
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
