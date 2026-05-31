import client from '@/lib/api/client';
import type { ProductType } from '@/lib/product-constants';

export type { ProductType };

export type ProductImageUpload = {
  bucket: string;
  url: string;
  storage_path: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
};

export type ProductVariantInput = {
  id?: string;
  sku_suffix: string;
  size?: string;
  color_name?: string;
  color_hex?: string;
  additional_price?: number;
  stock_qty?: number;
  is_active?: boolean;
  image_url?: string;
};

export type ProductImage = {
  id?: string;
  url: string;
  bucket?: string | null;
  storage_path?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
  is_active?: boolean;
};

export type ProductVariant = {
  id?: string;
  sku_suffix: string;
  size?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  additional_price?: number | null;
  stock_qty?: number | null;
  is_active?: boolean;
  image_url?: string | null;
};

export type ProductListItem = {
  id: string;
  name: string;
  sku: string;
  slug?: string;
  description?: string;
  short_description?: string;
  base_price?: number;
  customization_fee?: number;
  production_days_min?: number;
  production_days_max?: number;
  product_type?: ProductType;
  collection_id?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  available_stock?: number | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type ListProductsParams = {
  cursor?: string;
  offset?: number;
  limit?: number;
  type?: ProductType;
  tag?: string;
  collection?: string;
  q?: string;
  is_featured?: boolean | string;
  sort_by?: string;
  min_price?: number;
  max_price?: number;
};

export type ListProductsResponse = {
  products: ProductListItem[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  product_type: ProductType;
  base_price: number;
  customization_fee?: number;
  production_days_min: number;
  production_days_max: number;
  is_active?: boolean;
  is_featured?: boolean;
};

export async function uploadProductImages(files: File[]): Promise<ProductImageUpload[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await client.post<{ images: ProductImageUpload[] }>('/uploads', formData, {
    params: {
      type: 'product',
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.images;
}

export async function createProduct(data: {
  product: CreateProductInput;
  images: ProductImageUpload[];
  variants: ProductVariantInput[];
}) {
  const response = await client.post<{ product: unknown }>('/products', data);
  return response.data;
}

export async function updateProduct(
  id: string,
  data: {
    product?: Partial<CreateProductInput>;
    images?: ProductImageUpload[];
    variants?: ProductVariantInput[];
  }
) {
  const response = await client.patch<{ product: unknown }>(`/products/${id}`, data);
  return response.data;
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
  const response = await client.get<ListProductsResponse>('/products', { params });
  return response.data;
}

export async function getProductById(id: string) {
  const response = await client.get<{ product: unknown }>(`/products/${id}`);
  return response.data;
}

export async function deleteProduct(id: string) {
  const response = await client.delete<{ message: string; product: unknown }>(`/products/${id}`);
  return response.data;
}
