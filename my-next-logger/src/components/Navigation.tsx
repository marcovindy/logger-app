// src/components/Navigation.tsx
"use client";

import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit"
          }}
        >
          FIRMA XY
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            href="/"
            variant={pathname === "/" ? "outlined" : "text"}
          >
            Domů
          </Button>

          <Button
            color="inherit"
            component={Link}
            href="/articles"
            variant={pathname === "/articles" ? "outlined" : "text"}
          >
            Články
          </Button>

          <Button
            variant="contained"
            color="secondary"
            component={Link}
            href="/articles/new"
          >
            Nový článek
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
