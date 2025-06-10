import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

export async function uploadToS3(key: string, body: Buffer) {
  const cmd = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body });
  await s3.send(cmd);
}

export async function downloadFromS3(key: string): Promise<Uint8Array> {
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  const resp = await s3.send(cmd);
  const body = await resp.Body?.transformToByteArray();
  return body || new Uint8Array();
}

export async function deleteFromS3(key: string) {
  const cmd = new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  await s3.send(cmd);
}
