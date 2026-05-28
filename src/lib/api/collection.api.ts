import client from '@/lib/api/client';
export type CollectionType = 'seasonal' | 'fandom' | 'event_drop' | 'permanent';

export type Collection = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  collection_type?: CollectionType;
  is_active: boolean;
  is_featured?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  cover_image_url?: string | null;
  banner_image_url?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  collection_products?: {
    id: string;
    collection_id: string;
    product_id: string;
    products: import('./product.api').ProductListItem;
  }[];
};

export type CollectionImageUpload = {
  bucket: string;
  url: string;
  storage_path: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
};

export type ListCollectionsParams = {
  cursor?: string;
  limit?: number;
  type?: string;
  is_featured?: boolean;
  search?: string;
  sort_by?: string;
};

export type ListCollectionsResponse = {
  collections: Collection[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type CreateCollectionInput = {
  name: string;
  slug: string;
  description?: string;
  collection_type: string;
  is_active?: boolean;
  is_featured?: boolean;
  starts_at?: string;
  ends_at?: string;
  cover_image_url?: string | null;
  banner_image_url?: string | null;
};

export async function listCollections(
  params: ListCollectionsParams = {}
): Promise<ListCollectionsResponse> {
  const response = await client.get<ListCollectionsResponse>('/collections', { params });
  return response.data;
}

export async function uploadCollectionImages(files: File[]): Promise<CollectionImageUpload[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await client.post<{ images: CollectionImageUpload[] }>('/uploads', formData, {
    params: {
      type: 'collection',
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.images;
}

export async function createCollection(
  data: CreateCollectionInput
): Promise<{ collection: Collection }> {
  const response = await client.post<{ collection: Collection }>('/collections', data);
  return response.data;
}

export async function updateCollection(
  id: string,
  data: Partial<CreateCollectionInput>
): Promise<{ collection: Collection }> {
  const response = await client.patch<{ collection: Collection }>(`/collections/${id}`, data);
  return response.data;
}

export async function syncCollectionProducts(
  id: string,
  productIds: string[]
): Promise<{ items: unknown[] }> {
  const response = await client.put<{ items: unknown[] }>(`/collections/${id}/products`, {
    product_ids: productIds,
  });
  return response.data;
}

export async function deleteCollection(id: string): Promise<{
  message?: string;
  collection: Collection;
}> {
  const response = await client.delete<{ message?: string; collection: Collection }>(
    `/collections/${id}`
  );
  return response.data;
}

export async function getCollectionById(id: string): Promise<{ collection: Collection }> {
  const response = await client.get<{ collection: Collection }>(`/collections/${id}`);
  return response.data;
}
