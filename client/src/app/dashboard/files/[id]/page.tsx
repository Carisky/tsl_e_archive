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

// PDF
import { Document, Page, pdfjs } from "react-pdf";
// Excel
import * as XLSX from "xlsx";
// DOCX → HTML
import mammoth from "mammoth";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function FilePreviewPage() {
  const { auth, initialized } = useAuth();
  const params = useParams();
  const router = useRouter();

  // state
  const [url, setUrl] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [excelData, setExcelData] = useState<any[][]>([]);

  // нормализуем id
  const rawId = params.id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const idNum = parseInt(idStr, 10);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    if (!idStr || isNaN(idNum)) {
      router.replace("/dashboard/files");
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
            const { value: html } = await mammoth.convertToHtml({
              arrayBuffer,
            });
            setHtml(html);
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
        setError("Не удалось загрузить файл");
      }
    })();
  }, [initialized, auth, idStr, idNum, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => router.push("/dashboard/files")}>Назад</Button>
      </Container>
    );
  }

  if (!url) {
    return <Container sx={{ mt: 4 }}>Loading…</Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={() => router.back()}>Back</Button>
        <Button component="a" href={url} download sx={{ ml: 2 }}>
          Download {type}
        </Button>
      </Box>

      {/* PDF */}
      {type === ".pdf" && (
        <Document file={url}>
          <Page pageNumber={1} width={800} />
        </Document>
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
        <Typography>Preview not supported for {type}</Typography>
      )}
    </Container>
  );
}
