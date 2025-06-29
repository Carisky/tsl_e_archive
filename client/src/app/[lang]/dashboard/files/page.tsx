"use client";
import { useEffect, useState, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
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
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [searching, setSearching] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const grouped = useMemo(() => {
    const res: Record<string, Record<string, any[]>> = {};
    const uncategorized = t("files.uncategorized");
    for (const f of files) {
      const year = new Date(f.createdAt).getFullYear().toString();
      if (!res[year]) res[year] = {};
      if (f.categories.length === 0) {
        if (!res[year][uncategorized]) res[year][uncategorized] = [];
        res[year][uncategorized].push(f);
        continue;
      }
      for (const fc of f.categories) {
        const cat = fc.category.name;
        if (!res[year][cat]) res[year][cat] = [];
        res[year][cat].push(f);
      }
    }
    return res;
  }, [files, t]);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
    } else {
      listFiles("", auth.token || "")
        .then(setFiles)
        .catch(() => {})
        .finally(() => setLoadingFiles(false));
    }
  }, [initialized, auth, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  const search = async () => {
    setSearching(true);
    const res = await listFiles(query, auth.token || "");
    setFiles(res);
    setSearching(false);
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
        <Button variant="contained" onClick={search} disabled={searching}>
          {searching ? <CircularProgress size={24} /> : t('files.searchBtn')}
        </Button>
      </Box>
      {loadingFiles ? (
        <CircularProgress />
      ) : (
      <List>
        {Object.entries(grouped).map(([year, cats]) => (
          <Accordion key={year} disableGutters>
            <AccordionSummary>{year}</AccordionSummary>
            <AccordionDetails>
              <List>
                {Object.entries(cats as Record<string, any[]>).map(
                  ([catName, fs]) => (
                    <Accordion key={catName} disableGutters sx={{ boxShadow: 0 }}>
                      <AccordionSummary>{catName}</AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {fs.map((f) => (
                            <ListItem key={f.id} sx={{ pl: 4 }}>
                              <ListItemText primary={f.filename} />
                              <Button
                                variant="outlined"
                                disabled={processingId === f.id}
                                onClick={() =>
                                  router.push(`/${lang}/dashboard/files/${f.id}`)
                                }
                              >
                                {t('files.preview')}
                              </Button>
                              <Button
                                disabled={processingId === f.id}
                                onClick={async () => {
                                  setProcessingId(f.id);
                                  try {
                                    const blob = await downloadFile(
                                      f.id,
                                      auth.token || ""
                                    );
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = f.filename;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  } finally {
                                    setProcessingId(null);
                                  }
                                }}
                              >
                                {processingId === f.id ? (
                                  <CircularProgress size={24} />
                                ) : (
                                  t('files.download')
                                )}
                              </Button>
                              {auth.user &&
                                (auth.user.role === 'ADMIN' ||
                                  auth.user.role === 'SUPERADMIN') && (
                                  <Button
                                    disabled={processingId === f.id}
                                    onClick={async () => {
                                      setProcessingId(f.id);
                                      try {
                                        await deleteFile(
                                          f.id,
                                          auth.token || '',
                                          auth.user?.role === 'SUPERADMIN'
                                        );
                                        setFiles(files.filter((x) => x.id !== f.id));
                                      } finally {
                                        setProcessingId(null);
                                      }
                                    }}
                                  >
                                    {processingId === f.id ? (
                                      <CircularProgress size={24} />
                                    ) : (
                                      t('files.delete')
                                    )}
                                  </Button>
                                )}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
      )}
    </Container>
  );
}
