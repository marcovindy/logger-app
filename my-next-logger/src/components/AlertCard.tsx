// components/AlertCard.tsx
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton
} from "@mui/material";

interface AlertCardProps {
  alert: {
    id: string;
    alertName: string;
    status: string;
    severity: string;
    value: string;
    description?: string;
    timestamp: Date;
  };
}

export function AlertCard({ alert }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <div>Critical</div>;
      case "warning":
        return <div>Warning</div>;
      default:
        return <div>Default</div>;
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 3,
        borderColor: `${getSeverityColor(alert.severity)}.main`
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {getSeverityIcon(alert.severity)}
            <Typography variant="h6">{alert.alertName}</Typography>
          </Box>
          <Chip
            label={alert.status}
            color={alert.status === "firing" ? "error" : "success"}
            size="small"
          />
        </Box>

        <Typography color="text.secondary" variant="body2" gutterBottom>
          Value: {alert.value}
        </Typography>

        {alert.description && (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            {alert.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={0.5} mt={2}>
          <Typography variant="caption" color="text.secondary">
            {new Date(alert.timestamp).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
