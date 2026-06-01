export const metadata = {
  title: 'Our Story - Florlen',
  description: 'Learn about Florlen and our handcrafted crochet story.',
};

export default function OurStoryPage() {
  return (
    <main className="text-on-surface text-sm leading-relaxed">
      <h1 className="text-center font-headline text-3xl font-bold uppercase mb-12">
        Our Story
      </h1>
      
      <p className="mb-8">
        Effective Date: June 1, 2026<br/>
        Last Updated: June 1, 2026
      </p>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">1. The Beginning</h2>
        <p className="mb-3">
          Florlen started with a simple idea: handcrafting the future of collectibles, one stitch at a time.
        </p>
        <p className="mb-3">
          We believe in slow-fashion, sustainable practices, and creating unique companions designed by you, handmade with love.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">2. The Craft</h2>
        <p className="mb-3">
          Every piece is meticulously crafted by our skilled artisans. We use only the finest organic cotton yarn and ensure every detail is perfect.
        </p>
        <p className="mb-3">
          We take pride in our work and strive to deliver the best quality products to our customers.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-bold text-base">3. Our Vision</h2>
        <p className="mb-3">
          To build a community of collectors and creators who appreciate the art of handmade goods, and to bring joy through personalized, high-quality crochet companions.
        </p>
      </section>
    </main>
  );
}
