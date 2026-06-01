export const metadata = {
  title: 'Sustainability - Florlen',
  description: 'Our commitment to a sustainable future.',
};

export default function SustainabilityPage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Sustainability
      </h1>
      
      <p className="mb-8">
        Effective Date: June 1, 2026<br/>
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. Our Commitment</h2>
        <p className="mb-3">
          At Florlen, sustainability is at the core of everything we do. We believe in slow-fashion, which means creating high-quality pieces that are made to last, rather than mass-produced items that end up in landfills.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. Materials</h2>
        <p className="mb-3">
          We use 100% organic cotton yarn and eco-friendly dyes. Our packaging is made from recycled materials and is fully recyclable or compostable.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. Ethical Practices</h2>
        <p className="mb-3">
          Our artisans are paid fair wages and work in safe, comfortable conditions. We are committed to supporting our local communities and empowering women through our craft.
        </p>
      </section>
    </main>
  );
}
