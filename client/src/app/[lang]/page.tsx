"use client";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

export default function Home() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? "en";

  const tiles = [
    { href: `/${lang}/login`, label: t("home.login") },
    { href: `/${lang}/register`, label: t("home.register") },
    { href: `/${lang}/about`, label: t("home.about") },
  ];

  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#070b12",
        backgroundImage: "url(radiant-gradient.png)",
        m: 0,
        width: "100%",
      }}
    >
      <Grid item xs={12}>
        <Typography variant="h3" textAlign="center">
          {t("home.welcome")}
        </Typography>
      </Grid>
      {tiles.map(({ href, label }) => (
        <Grid item key={href} xs={10} sm={6} md={3}>
          <Card>
            <CardActionArea href={href} sx={{ height: 120 }}>
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" textAlign="center">
                  {label}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
