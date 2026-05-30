import client from './client';
import { ProductListItem } from './product.api';
import { CartItem } from './cart.api';

export type DesignStatus = 'draft' | 'generating' | 'failed' | 'ready' | 'finalized';

export interface Design {
  id: string;
  user_id?: string | null;
  product_id: string;
  prompt_text?: string | null;
  selected_colors?: Record<string, any> | null;
  complexity_score?: number | null;
  mockup_image_url?: string | null;
  mockup_storage_path?: string | null;
  ai_prompt_used?: string | null;
  color_palette?: string[] | null;
  material_suggestions?: string[] | null;
  customization_fee: number;
  status: DesignStatus;
  generation_attempts: number;
  variant_suggestions?: any[] | null;
  created_at: string;
  updated_at: string;
  products?: ProductListItem | null; // Attached base product
}

export interface EphemeralDesign {
  mockup_image_url: string;
  ai_prompt_used: string;
  color_palette?: string[] | null;
  material_suggestions?: string[] | null;
  customization_fee: number;
  prompt_text: string;
}

export interface GenerationRequest {
  productType: 'mini_figure' | 'bag' | 'hat';
  options?: Record<string, any>;
  customPrompt?: string;
}

export interface SaveRequest {
  productType: 'mini_figure' | 'bag' | 'hat';
  options?: Record<string, any>;
  customPrompt?: string;
  mockupImageUrl: string;
  aiPromptUsed: string;
  colorPalette?: string[] | null;
  materialSuggestions?: string[] | null;
  customizationFee: number;
  attempts: number;
}

export interface SingleDesignResponse {
  message: string;
  resource: Design;
}

export interface ListDesignsResponse {
  message: string;
  resources: Design[];
}

export interface EphemeralDesignResponse {
  message: string;
  resource: EphemeralDesign;
}

export interface FinalizeDesignResponse {
  message: string;
  resource: Design;
  cartItem: CartItem;
}

/**
 * Fetch all saved designs belonging to the authenticated user.
 */
export async function listDesigns(): Promise<Design[]> {
  const response = await client.get<ListDesignsResponse>('/designs');
  return response.data.resources;
}

/**
 * Get a specific design detail by ID.
 */
export async function getDesignById(id: string): Promise<Design> {
  const response = await client.get<SingleDesignResponse>(`/designs/${id}`);
  return response.data.resource;
}

/**
 * Create a new dynamic mockup preview (Ephemeral - does NOT write to the database).
 */
export async function generateDesign(data: GenerationRequest): Promise<EphemeralDesign> {
  const response = await client.post<EphemeralDesignResponse>('/designs/generate', data);
  return response.data.resource;
}

/**
 * Save an ephemeral design mockup as a DRAFT in the user's library.
 */
export async function saveDesignDraft(data: SaveRequest): Promise<Design> {
  const response = await client.post<SingleDesignResponse>('/designs/save', data);
  return response.data.resource;
}

/**
 * Lock an ephemeral design mockup (status FINALIZED) and add it to the shopping cart.
 */
export async function finalizeDesign(data: SaveRequest): Promise<FinalizeDesignResponse> {
  const response = await client.post<FinalizeDesignResponse>('/designs/finalize', data);
  return response.data;
}

/**
 * Lock an existing draft design (FINALIZED) from the library and add it to the shopping cart.
 */
export async function finalizeExistingDesign(id: string): Promise<FinalizeDesignResponse> {
  const response = await client.post<FinalizeDesignResponse>(`/designs/${id}/finalize`);
  return response.data;
}

/**
 * Delete a saved design draft from the library.
 */
export async function deleteDesign(id: string): Promise<void> {
  await client.delete(`/designs/${id}`);
}

export interface DailyLimitData {
  count: number;
  limit: number;
}

export interface DailyLimitResponse {
  message: string;
  resource: DailyLimitData;
}

/**
 * Get daily designs count and maximum limit.
 */
export async function getDailyLimit(): Promise<DailyLimitData> {
  const response = await client.get<DailyLimitResponse>('/designs/daily-limit');
  return response.data.resource;
}

export interface AIConfig {
  productBasePrices: Record<string, number>;
  accessoriesConfig: Record<string, { labelKey: string; label: string; price: number }>;
  illustrationPrice: number;
}

export interface AdminAIConfig extends AIConfig {
  geminiApiKey: string;
}

/**
 * Fetch dynamic AI public pricing configs
 */
export async function getAIConfig(): Promise<AIConfig> {
  const response = await client.get<{ resource: AIConfig }>('/designs/config');
  return response.data.resource;
}

/**
 * Fetch dynamic AI admin configurations (Admin Only)
 */
export async function getAdminAIConfig(): Promise<AdminAIConfig> {
  const response = await client.get<{ resource: AdminAIConfig }>('/admin/ai/config');
  return response.data.resource;
}

/**
 * Update dynamic AI admin configurations (Admin Only)
 */
export async function updateAdminAIConfig(config: AdminAIConfig): Promise<void> {
  await client.put('/admin/ai/config', config);
}
