const required = ["MONGODB_URI", "JWT_SECRET"];

export const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
  }

  const provider = process.env.STORAGE_PROVIDER || "local";
  if (provider === "s3") {
    const s3Required = ["S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
    const missingS3 = s3Required.filter((key) => !process.env[key]);
    if (missingS3.length) {
      throw new Error(`Missing required S3 env variables: ${missingS3.join(", ")}`);
    }
  }
};

export const isS3Storage = () => (process.env.STORAGE_PROVIDER || "local") === "s3";
