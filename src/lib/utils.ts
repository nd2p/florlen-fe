import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "0đ";
  return new Intl.NumberFormat('vi-VN').format(amount) + "đ";
}
