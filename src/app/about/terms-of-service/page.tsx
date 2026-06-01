export const metadata = {
  title: 'Terms of Service - Florlen',
  description: 'Terms and conditions for using Florlen services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Terms of Service
      </h1>
      
      <p className="mb-8">
        Effective Date: June 1, 2026<br/>
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. General</h2>
        <p className="mb-3">
          Welcome to Florlen! By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of the Florlen website and the purchase of any products from us.
        </p>
        <p className="mb-3">
          We reserve the right to update these terms at any time.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. Products and Pricing</h2>
        <p className="mb-2">2.1 All our products are handcrafted, which means there may be slight variations between the product images and the actual item you receive.</p>
        <p className="mb-3">2.2 Prices are subject to change without notice.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. Orders and Payments</h2>
        <p className="mb-3">
          When you place an order, you agree to provide current, complete, and accurate purchase and account information. We reserve the right to refuse or cancel any order.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">4. Return Policy</h2>
        <p className="mb-3">
          Due to the custom, handmade nature of our products, we generally do not accept returns. However, if your item arrives damaged, please contact us within 7 days of delivery to discuss a replacement or refund.
        </p>
      </section>
    </main>
  );
}
