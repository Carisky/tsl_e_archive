"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listFiles, downloadFile, deleteFile } from "@/api/file";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function FilesPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
    } else {
      listFiles("", auth.token || "")
        .then(setFiles)
        .catch(() => {});
    }
  }, [initialized, auth, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  const search = async () => {
    const res = await listFiles(query, auth.token || "");
    setFiles(res);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('files.title')}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label={t('files.search')}
          fullWidth={true}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={search}>
          {t('files.searchBtn')}
        </Button>
      </Box>
      <List>
        {files.map((f) => (
          <ListItem key={f.id}>
            <ListItemText
              primary={f.filename}
              secondary={f.categories
                .map((c: any) => c.category.name)
                .join(", ")}
            />
            <Button
              variant="outlined"
              onClick={() => router.push(`/${lang}/dashboard/files/${f.id}`)}
            >
              {t('files.preview')}
            </Button>
            <Button
              onClick={async () => {
                const blob = await downloadFile(f.id, auth.token || "");
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = f.filename;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              {t('files.download')}
            </Button>
            {auth.user &&
              (auth.user.role === "ADMIN" ||
                auth.user.role === "SUPERADMIN") && (
                <Button
                  onClick={async () => {
                    await deleteFile(
                      f.id,
                      auth.token || "",
                      auth.user?.role === "SUPERADMIN"
                    );
                    setFiles(files.filter((x) => x.id !== f.id));
                  }}
                >
                  {t('files.delete')}
                </Button>
              )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
