export interface UploadedImage {
  id: string;
  name: string;
  url: string; // Data URL or object URL for the image preview
  file: File; // The original file object
  categoryId?: string; // Optional: ID of the category this image belongs to
  hasSticker?: boolean; // Optional: Tracks if the image has a sticker applied
}

export interface Category {
  id: string;
  name: string;
  parentId?: string; // ID of the parent category, if this is a subcategory
}

export interface OverlayImageState {
  id: string; // Unique identifier for the overlay
  src: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  originalWidth: number;
  originalHeight: number;
  isVisible: boolean;
}

export interface GeneratedAiImage {
  id: string;
  src: string; // base64 data URL
  prompt: string;
  originalPrompt: string; // User's original prompt before "Realistic, UHD..."
}

export type AppView = 'gallery' | 'aiImageGenerator';