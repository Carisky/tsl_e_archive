import { Box, Button, Typography } from "@mui/material";

export default function Home() {
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
          <Typography variant="h3">Welcome to TSL e-archive</Typography>
        </Box>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href="/login"
        >
          Login
        </Button>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href="register"
        >
          Register
        </Button>
        <Button
          sx={{
            marginTop: "20px",
          }}
          variant="contained"
          href="/about"
        >
          About App
        </Button>
      </Box>
    </Box>
  );
}
