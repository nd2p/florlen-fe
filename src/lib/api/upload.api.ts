import client from '@/lib/api/client';

export interface UploadImageItem {
  type: string;
  bucket: string;
  url: string;
  storage_path: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
}

export interface UploadImageResponse {
  images: UploadImageItem[];
}

/**
 * Upload an avatar image (type = reference, saves to reference-uploads)
 */
export async function uploadAvatarImage(file: File): Promise<UploadImageItem> {
  const formData = new FormData();
  formData.append('images', file);

  const response = await client.post<UploadImageResponse>('/uploads', formData, {
    params: {
      type: 'reference',
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data?.images || response.data.images.length === 0) {
    throw new Error('Upload failed: no image returned');
  }

  return response.data.images[0];
}

/**
 * Delete an uploaded image from Supabase Storage
 */
export async function deleteUploadedImage(bucket: string, path: string): Promise<{ message: string }> {
  const response = await client.delete<{ message: string }>('/uploads', {
    data: { bucket, path },
  });
  return response.data;
}
