// src/app/test/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function TestPage() {
  const [metrics, setMetrics] = useState<string>("");

  const fetchMetrics = async () => {
    const response = await fetch("/api/metrics");
    const text = await response.text();
    setMetrics(text);
  };

  const generateSample = async () => {
    await fetch("/api/test-data/sample");
    fetchMetrics();
  };

  const generateRandom = async () => {
    await fetch("/api/test-data/generate");
    fetchMetrics();
  };

  const resetMetrics = async () => {
    await fetch("/api/metrics/reset", { method: "POST" });
    fetchMetrics();
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Metrics Test Page</h1>

      <div className="space-x-4 mb-4">
        <button
          onClick={generateSample}
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Generate Sample Data
        </button>

        <button
          onClick={generateRandom}
          className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Generate Random Data
        </button>

        <button
          onClick={resetMetrics}
          className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Reset Metrics
        </button>
      </div>

      <pre className="bg-gray-100 text-black p-4 rounded">{metrics}</pre>
    </div>
  );
}
