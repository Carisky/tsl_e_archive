import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
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
