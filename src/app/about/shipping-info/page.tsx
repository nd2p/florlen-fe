export const metadata = {
  title: 'Shipping Info - Florlen',
  description: 'Information about shipping and delivery.',
};

export default function ShippingInfoPage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Shipping Info
      </h1>
      
      <p className="mb-8">
          Effective Date: June 1, 2026<br />
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. General Delivery Terms</h2>
        <p className="mb-3">
          We ship our handmade companions worldwide. Here is everything you need to know about our shipping and delivery processes.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. Processing Time</h2>
        <p className="mb-3">
          Because every item is meticulously handcrafted to order, please allow 5-10 business days for your companion to be created before it is shipped.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. Shipping Rates & Times</h2>
        <p className="mb-2">3.1 <strong>Domestic (Vietnam):</strong> 2-4 business days. Standard shipping fee applies.</p>
        <p className="mb-3">3.2 <strong>International:</strong> 7-15 business days depending on the destination country. Shipping fees are calculated at checkout.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">4. Tracking Your Order</h2>
        <p className="mb-3">
          Once your order has been shipped, you will receive a confirmation email with tracking information so you can monitor your package&apos;s journey.
        </p>
      </section>
    </main>
  );
}
