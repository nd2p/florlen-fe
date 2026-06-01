export const metadata = {
  title: 'Privacy Policy - Florlen',
  description: 'Our privacy policy and data practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Privacy Policy
      </h1>
      
      <p className="mb-8">
        Effective Date: June 1, 2026<br/>
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. General Terms</h2>
        <p className="mb-3">
          At Florlen, we value your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information.
        </p>
        <p className="mb-3">
          By accessing or using our website, you agree to the terms of this Privacy Policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. Information We Collect</h2>
        <p className="mb-3">
          We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact customer support. This may include your name, email address, phone number, shipping address, and payment information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. How We Use Your Information</h2>
        <p className="mb-2">We use your information for the following purposes:</p>
        <p className="mb-2">3.1 To process and fulfill your orders.</p>
        <p className="mb-2">3.2 To communicate with you about your order status.</p>
        <p className="mb-2">3.3 To send you promotional emails (if you have opted in).</p>
        <p className="mb-3">3.4 To improve our website and customer service.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">4. Data Security</h2>
        <p className="mb-3">
          We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure.
        </p>
      </section>
    </main>
  );
}
