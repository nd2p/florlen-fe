export const metadata = {
  title: 'Care Guide - Florlen',
  description: 'How to care for your handmade Florlen companions.',
};

export default function CareGuidePage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Care Guide
      </h1>
      
      <p className="mb-8">
        Effective Date: June 1, 2026<br/>
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. General Care</h2>
        <p className="mb-3">
          Your Florlen companion is handmade with love and needs a little care to stay looking its best. Follow these simple instructions to keep your crochet piece clean and intact.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. Washing</h2>
        <p className="mb-2">2.1 Hand wash only using cold or lukewarm water.</p>
        <p className="mb-2">2.2 Use a mild, eco-friendly detergent.</p>
        <p className="mb-3">2.3 Gently squeeze the water through the item. Do not wring or scrub.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. Drying</h2>
        <p className="mb-2">3.1 Press out excess water gently with a clean towel.</p>
        <p className="mb-2">3.2 Lay flat to dry on a dry towel in a shaded area.</p>
        <p className="mb-3">3.3 Do not tumble dry or place in direct sunlight.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">4. Reshaping</h2>
        <p className="mb-3">
          While the item is still damp, gently pull and pat it back into its original shape. Do not iron.
        </p>
      </section>
    </main>
  );
}
