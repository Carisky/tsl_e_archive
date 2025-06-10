"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getFileLink } from "@/api/file";
import {
  Container,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// PDF
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
// Excel
import * as XLSX from "xlsx";
// DOCX → HTML
import { renderAsync } from "docx-preview";
export default function FilePreviewPage() {
  const { auth, initialized } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = Array.isArray(params.lang)
    ? params.lang[0]
    : params.lang ?? "en";
  const { t } = useTranslation();

  // state
  const [url, setUrl] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(2);

  // нормализуем id
  const rawId = params.id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const idNum = parseInt(idStr, 10);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
      return;
    }
    if (!idStr || isNaN(idNum)) {
      router.replace(`/${lang}/dashboard/files`);
      return;
    }

    (async () => {
      try {
        const { url, type } = await getFileLink(idNum, auth.token!);
        setUrl(url);
        setType(type);

        switch (type) {
          case ".txt": {
            const res = await fetch(url);
            const t = await res.text();
            setText(t);
            break;
          }
          case ".pdf":
            // ничего доп. не нужно — <Document> сам подхватит
            break;
          case ".jpeg":
          case ".jpg":
          case ".png":
          case ".gif":
            // <img> справится
            break;
          case ".xlsx":
          case ".xls": {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const wb = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            setExcelData(data);
            break;
          }
          case ".docx": {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            // после renderAsync будет вставлен весь документ
            await renderAsync(
              arrayBuffer,
              document.getElementById("docx-container")!
            );
            break;
          }
          case ".odt": {
            // Чаще всего проще через Google Docs Viewer
            setHtml(`
              <iframe
                src="https://docs.google.com/viewer?url=${encodeURIComponent(
                  url
                )}&embedded=true"
                width="100%" height="800px"
              ></iframe>
            `);
            break;
          }
          default:
            // неизвестный — покажем кнопку download
            break;
        }
      } catch (e: any) {
        console.error(e);
        setError(t("file.failed"));
      }
    })();
  }, [initialized, auth, idStr, idNum, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => router.push(`/${lang}/dashboard/files`)}>
          {t("file.back")}
        </Button>
      </Container>
    );
  }

  if (!url) {
    return <Container sx={{ mt: 4 }}>{t("file.loading")}</Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={() => router.back()}>{t("file.back")}</Button>
        <Button component="a" href={url} download sx={{ ml: 2 }}>
          {t("files.download")} {type}
        </Button>
      </Box>

      {/* PDF */}
      {type === ".pdf" && (
        <Container sx={{ mt: 4 }}>
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
          <Box sx={{
            display:"flex"
          }}>
            <Typography>
            Page {pageNumber} of {numPages}
          </Typography>
          <Button onClick={()=>{setPageNumber(pageNumber-1)}}>{'<'}</Button>
          <Button onClick={()=>{setPageNumber(pageNumber+1)}}>{'>'}</Button>
          </Box>
        </Container>
      )}

      {/* IMAGE */}
      {[".jpeg", ".jpg", ".png", ".gif"].includes(type) && (
        <Box
          component="img"
          src={url}
          alt="preview"
          sx={{ maxWidth: "100%" }}
        />
      )}

      {/* TXT */}
      {type === ".txt" && (
        <Box component="pre" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Box>
      )}

      {/* EXCEL */}
      {(type === ".xlsx" || type === ".xls") && excelData.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              {excelData[0].map((_, i) => (
                <TableCell key={i}>Col{i + 1}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {excelData.slice(1).map((row, ri) => (
              <TableRow key={ri}>
                {row.map((cell, ci) => (
                  <TableCell key={ci}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* DOCX */}
      {type === ".docx" && html && (
        <Box
          sx={{ "& img": { maxWidth: "100%" } }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {/* ODT */}
      {type === ".odt" && html && (
        <Box dangerouslySetInnerHTML={{ __html: html }} />
      )}
      <Container>
        {/* DOCX */}
        {type === ".docx" && (
          <Box id="docx-container" sx={{ "& img": { maxWidth: "100%" } }} />
        )}
      </Container>
      {/* fallback */}
      {![
        ".pdf",
        ".jpeg",
        ".jpg",
        ".png",
        ".gif",
        ".txt",
        ".xlsx",
        ".xls",
        ".docx",
        ".odt",
      ].includes(type) && (
        <Typography>{t("file.previewUnsupported", { type })}</Typography>
      )}
    </Container>
  );
}
