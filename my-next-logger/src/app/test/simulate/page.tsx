// app/test/simulate/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button, Box, Typography, LinearProgress, Alert } from "@mui/material";

export default function SimulatePage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    setProgress(0);

    try {
      for (let i = 0; i < 10; i++) {
        await fetch("/api/test/simulate-load", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "increase" })
        });

        setProgress((i + 1) * 10);
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    } catch (error) {
      setError(
        "Simulation failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = async () => {
    try {
      await fetch("/api/test/simulate-load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
      setProgress(0);
      setError(null);
    } catch (error) {
      setError(
        "Reset failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Load Simulation Test
      </Typography>

      <Box display="flex" gap={2} my={3}>
        <Button
          variant="contained"
          onClick={startSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? "Simulating..." : "Start Simulation"}
        </Button>

        <Button
          variant="outlined"
          onClick={resetSimulation}
          disabled={isSimulating}
        >
          Reset Load
        </Button>
      </Box>

      {isSimulating && (
        <Box my={3}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary" mt={1}>
            Progress: {progress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isSimulating && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Simulation in progress... Watch Grafana for alerts
        </Alert>
      )}
    </Box>
  );
}
