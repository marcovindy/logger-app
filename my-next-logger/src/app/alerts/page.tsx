// app/alerts/page.tsx
import { AlertRepository } from "@/lib/repositories/alert";
import { AlertCard } from "@/components/AlertCard";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";

export default async function AlertsPage() {
  const alerts = await AlertRepository.findRecent();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="h4" component="h1">
            Alert History
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {alerts.map((alert: any) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}

          {alerts.length === 0 && (
            <Typography color="text.secondary" align="center" py={4}>
              No alerts found
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
