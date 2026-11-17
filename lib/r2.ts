import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function getRequiredEnv(
  name:
    | "R2_ACCOUNT_ID"
    | "R2_ACCESS_KEY_ID"
    | "R2_SECRET_ACCESS_KEY"
    | "R2_BUCKET_NAME",
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} no está configurada.`,
    );
  }

  return value;
}

const accountId =
  getRequiredEnv("R2_ACCOUNT_ID");

const accessKeyId =
  getRequiredEnv("R2_ACCESS_KEY_ID");

const secretAccessKey =
  getRequiredEnv(
    "R2_SECRET_ACCESS_KEY",
  );

export const r2BucketName =
  getRequiredEnv("R2_BUCKET_NAME");

export const r2Client =
  new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

type UploadR2ObjectInput = {
  key: string;
  body: Uint8Array;
  contentType: string;
};

export async function uploadR2Object({
  key,
  body,
  contentType,
}: UploadR2ObjectInput) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
  };
}

export async function getR2Object(
  key: string,
) {
  const object =
    await r2Client.send(
      new GetObjectCommand({
        Bucket: r2BucketName,
        Key: key,
      }),
    );

  if (!object.Body) {
    throw new Error(
      "El objeto de R2 no contiene datos.",
    );
  }

  const body =
    await object.Body.transformToByteArray();

  return {
    body,
    contentType:
      object.ContentType ??
      "application/octet-stream",
    cacheControl:
      object.CacheControl ??
      null,
    etag:
      object.ETag ??
      null,
  };
}

export async function deleteR2Object(
  key: string,
) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }),
  );
}