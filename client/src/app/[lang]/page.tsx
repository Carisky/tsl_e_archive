"use client";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

export default function Home() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? "en";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",

        height: "100vh",
        width: "100%",
        backgroundColor: "#070b12",
        position: "relative",
        backgroundImage: " url(radiant-gradient.png);",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          marginTop: "5%",
        }}
      >
        <Box>
          <Typography variant="h3">{t("home.welcome")}</Typography>
        </Box>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href={`/${lang}/login`}
        >
          {t("home.login")}
        </Button>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href={`/${lang}/register`}
        >
          {t("home.register")}
        </Button>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href={`/${lang}/about`}
        >
          {t("home.about")}
        </Button>
      </Box>
    </Box>
  );
}
