'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconShoppingBag,
  IconHome,
  IconReceipt,
} from '@tabler/icons-react';
import { syncPayment } from '@/lib/api/order.api';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useTranslation('common');
  const { clearCart, fetchCart } = useCartStore();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  // PayOS redirects back with these params
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');
  const cancel = searchParams.get('cancel');

  const [syncStatus, setSyncStatus] = useState<'loading' | 'success' | 'failed'>(() => {
    const isCancelled = cancel === 'true' || status === 'CANCELLED';
    if (isCancelled || !orderCode) {
      return 'failed';
    }
    return 'loading';
  });

  const isSuccess = syncStatus === 'success';

  // Verify and sync payment status with the backend
  useEffect(() => {
    let isMounted = true;
    if (syncStatus === 'loading' && orderCode) {
      syncPayment(Number(orderCode))
        .then((res) => {
          if (!isMounted) return;
          if (res.success) {
            setSyncStatus('success');
            clearCart();
            // Re-fetch cart from server (which should now be empty)
            fetchCart().catch(() => { /* cart may not exist anymore */ });
          } else {
            setSyncStatus('failed');
          }
        })
        .catch((err) => {
          console.error('Payment sync error:', err);
          if (isMounted) {
            setSyncStatus('failed');
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [syncStatus, orderCode, clearCart, fetchCart]);

  // Auto-redirect cancelled payments back to checkout after a delay
  useEffect(() => {
    if (syncStatus === 'failed') {
      const timer = setTimeout(() => {
        router.push('/checkout');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, router]);

  if (syncStatus === 'loading') {
    return <PaymentResultLoading />;
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        {/* Result Card */}
        <div className="bg-surface-container-low rounded-2xl p-8 md:p-12 shadow-lg border border-surface-container-high/50 text-center space-y-6 animate-in zoom-in-95 fade-in duration-500">
          {/* Icon */}
          {isSuccess ? (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-700">
                <IconCircleCheck
                  className="w-12 h-12 text-primary"
                  stroke={1.5}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center animate-in zoom-in duration-700">
                <IconCircleX
                  className="w-12 h-12 text-error"
                  stroke={1.5}
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black text-on-surface">
              {isSuccess
                ? (isVi ? 'Thanh Toán Thành Công!' : 'Payment Successful!')
                : (isVi ? 'Thanh Toán Thất Bại' : 'Payment Failed')}
            </h1>
            <p className="text-secondary text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              {isSuccess
                ? (isVi
                    ? 'Cảm ơn bạn! Đơn hàng của bạn đã được xác nhận và đang được xử lý.'
                    : 'Thank you! Your order has been confirmed and is being processed.')
                : (isVi
                    ? 'Thanh toán chưa được hoàn tất. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'
                    : 'Payment was not completed. You can try again or contact support.')}
            </p>
          </div>

          {/* Order Code Info */}
          {orderCode && (
            <div className="bg-surface-container-high/50 rounded-xl px-6 py-4 border border-surface-container-highest/60">
              <span className="text-xs text-secondary font-semibold uppercase tracking-wider block mb-1">
                {isVi ? 'Mã Thanh Toán' : 'Payment Code'}
              </span>
              <span className="font-headline font-extrabold text-lg text-on-surface select-all">
                {orderCode}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isSuccess
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-error/10 text-error border border-error/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <IconCircleCheck className="w-3.5 h-3.5" stroke={2.5} />
                  {isVi ? 'Đã Xác Nhận' : 'Confirmed'}
                </>
              ) : (
                <>
                  <IconCircleX className="w-3.5 h-3.5" stroke={2.5} />
                  {status === 'CANCELLED'
                    ? (isVi ? 'Đã Huỷ' : 'Cancelled')
                    : (isVi ? 'Thất Bại' : 'Failed')}
                </>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {isSuccess ? (
              <>
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12 shadow-[0_10px_20px_-5px_rgba(164,0,21,0.2)]"
                >
                  <Link href="/">
                    <IconHome className="w-5 h-5" stroke={2} />
                    {isVi ? 'Về Trang Chủ' : 'Back to Home'}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12"
                >
                  <Link href="/shop">
                    <IconShoppingBag className="w-5 h-5" stroke={2} />
                    {isVi ? 'Tiếp Tục Mua Sắm' : 'Continue Shopping'}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12"
                  onClick={() => router.push('/checkout')}
                >
                  <IconReceipt className="w-5 h-5" stroke={2} />
                  {isVi ? 'Thử Lại' : 'Try Again'}
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12"
                >
                  <Link href="/">
                    <IconHome className="w-5 h-5" stroke={2} />
                    {isVi ? 'Về Trang Chủ' : 'Back to Home'}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-secondary mt-6 leading-relaxed max-w-sm mx-auto">
          {isVi
            ? 'Nếu bạn gặp vấn đề với đơn hàng, vui lòng liên hệ hỗ trợ qua email hoặc chat.'
            : 'If you experience any issues with your order, please contact our support via email or chat.'}
        </p>
      </div>
    </div>
  );
}

// Loading fallback while search params resolve
function PaymentResultLoading() {
  const { i18n } = useTranslation('common');
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <IconLoader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
        <p className="text-secondary text-sm font-medium">
          {isVi ? 'Đang xác nhận thanh toán...' : 'Confirming your payment...'}
        </p>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultLoading />}>
      <PaymentResultContent />
    </Suspense>
  );
}
