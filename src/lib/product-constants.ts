export const PRODUCT_TYPE = Object.freeze({
  NORMAL: 'normal',
  AI_BASE: 'ai_base',
});

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
