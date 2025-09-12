// cloudinary.types.ts
export type UploadApiResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  url?: string;
  [key: string]: any;
};
