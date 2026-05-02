const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
  }

  const provider = process.env.STORAGE_PROVIDER || "local";
  if (!["local", "cloudinary"].includes(provider)) {
    throw new Error("STORAGE_PROVIDER must be either 'local' or 'cloudinary'.");
  }

  if (provider === "cloudinary") {
    const cloudinaryRequired = [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET"
    ];
    const missingCloudinary = cloudinaryRequired.filter((key) => !process.env[key]);
    if (missingCloudinary.length) {
      throw new Error(`Missing required Cloudinary env variables: ${missingCloudinary.join(", ")}`);
    }
  }
};

export const isCloudinaryStorage = () => (process.env.STORAGE_PROVIDER || "local") === "cloudinary";
