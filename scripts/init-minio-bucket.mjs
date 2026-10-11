import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

const env = (key, fallback) => {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : fallback;
};
const endpoint = env("S3_ENDPOINT", "http://localhost:9002");
const bucket = env("S3_BUCKET", "kivro-dev");
const accessKey = env("S3_ACCESS_KEY", "kivro");
const secretKey = env("S3_SECRET_KEY", "kivrodevsecret");

const client = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
});

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log(`Bucket "${bucket}" already exists.`);
} catch {
  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Created bucket "${bucket}".`);
}
