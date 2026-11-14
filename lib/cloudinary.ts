import { v2 as cloudinary } from "cloudinary";

export const cloudinaryEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/** Produce signed params for a direct browser upload to Cloudinary. */
/** Applied while a video uploads, so only the small version is stored: 720px max, low quality, 600 kbit/s cap. */
export const VIDEO_UPLOAD_TRANSFORMATION = "c_limit,w_720,q_auto:low,br_600k,vc_h264,ac_aac";

export function signUpload(folder = "store/products", opts: { video?: boolean } = {}) {
  const timestamp = Math.round(Date.now() / 1000);
  const transformation = opts.video ? VIDEO_UPLOAD_TRANSFORMATION : undefined;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, ...(transformation ? { transformation } : {}) },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    folder,
    signature,
    ...(transformation ? { transformation } : {}),
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

export { cloudinary };
