#!/bin/bash

# Array of error types
error_types=("validation_error" "network_error" "database_error" "auth_error")

# Generate errors
for type in "${error_types[@]}"; do
    # Random number of errors (1-3)
    count=$((RANDOM % 3 + 1))

    for ((i = 1; i <= count; i++)); do
        curl -X POST http://localhost:3000/api/metrics/collect \
            -H "Content-Type: application/json" \
            -d "{
        \"type\": \"blog_errors_total\",
        \"labels\": {
          \"type\": \"$type\",
          \"article_id\": \"$((RANDOM % 5 + 1))\"
        },
        \"value\": 1
      }"
        echo "Generated $type error"
    done
done
