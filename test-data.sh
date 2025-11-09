#!/bin/bash
# test-metrics.sh

# Reset metrik
echo "Resetting metrics..."
curl -X POST http://localhost:3000/api/metrics/reset

# Počkáme chvíli
sleep 1

# Generujeme sample data
echo -e "\nGenerating sample data..."
curl http://localhost:3000/api/test-data/sample

# Počkáme chvíli
sleep 1

# Kontrola metrik
echo -e "\nChecking metrics..."
curl http://localhost:3000/api/metrics

# Generujeme náhodná data
echo -e "\nGenerating random data..."
for i in {1..5}; do
    curl http://localhost:3000/api/test-data/generate
    sleep 1
done

# Finální kontrola metrik
echo -e "\nFinal metrics state:"
curl http://localhost:3000/api/metrics
