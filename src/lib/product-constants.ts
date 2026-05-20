export const PRODUCT_TYPE = Object.freeze({
  NORMAL: 'normal',
  AI_BASE: 'ai_base',
  ADD_ONS: 'add_ons',
});

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
