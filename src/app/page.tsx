import Image from "next/image";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="space-y-24 pt-16">
        <section className="w-full">
          <HeroCarousel />
        </section>

        <section className="mx-auto max-w-7xl px-8">
          <div className="mb-12 flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="font-headline text-4xl font-black tracking-tight">Featured Designs</h2>
              <p className="text-secondary">Explore our most loved handcrafted companions.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest transition-all hover:bg-primary hover:text-white" aria-label="Previous featured design">&lt;</button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest transition-all hover:bg-primary hover:text-white" aria-label="Next featured design">&gt;</button>
            </div>
          </div>

          <div className="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-4">
            <div className="group flex cursor-pointer flex-col justify-between rounded-lg bg-surface-container-lowest p-6 md:col-span-2 md:row-span-2">
              <div className="relative mb-6 flex-grow overflow-hidden rounded-[1rem]">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Forest guardian plush"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhet732nalbOiZv3XLoijV3G1Zio844lD0mS1FERu1SaVonEIhci57T9kSTAvrVcMKBLxCSvhiZMaxJmuE7_zioyB4BZqkn_HpnkFHHj7Ce-zfgpr42mUR9KWx_d0S3ZODYNKcyylrhK6zVA6UpHY4QHp9udCfxbGBG6lHZ65Y176II9tagSru15LlI0qBTpS9eu6HdLYe0lOH88NXp5GwloKLrSiQlmzL8_s75bv0D4Zq_oCg2m-ZNMgAbDRU70_T47t-2-tsJs8"
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">Masterpiece</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-on-surface">Forest Guardian</h3>
                <p className="text-secondary">Limited Edition Artist Series</p>
              </div>
            </div>

            <div className="group flex cursor-pointer items-center gap-6 rounded-lg bg-surface-container-low p-6 md:col-span-2">
              <div className="relative aspect-square w-1/3 overflow-hidden rounded-[1rem]">
                <Image
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  alt="Midnight whale yarn"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3fR7P5tzQBXBNBWRBj6kC2r-t_e3PlPesHduxJVCwXWAjlWnq_5tBDZEOhpJSjVvbjTJHSmJsmWhgjNIQhyaSQmKx3TiBfQqC-nP_BvEMbNSVPwmenEDFxf9liALUD4avQ34wDLg6IonhzsqbowBPhKKhmPSKHNAfNquPZwrEU9Gt45HzBSZKLycQ8JaPaiF3pIwFbEN2SKqec1AmJFHKgB6h8yyN3D0J9ugQp5SIBfLhqZ4YlVlt-IyhHMf7wfht5oa_Bzka60c"
                />
              </div>
              <div className="w-2/3">
                <h3 className="text-xl font-bold">Midnight Whale</h3>
                <p className="text-sm text-secondary">Deep sea indigo collection</p>
              </div>
            </div>

            <div className="group relative cursor-pointer rounded-lg bg-surface-container-high p-6">
              <div className="relative mb-4 aspect-square overflow-hidden rounded-[1rem]">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  alt="Mini rex plush"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8ysV23Fb92NP72CCJHFH85oRH4lTikl8p6r7_am4DKoWQG1ILC4Q9B3UuaAzOOYrkyGUmAs_k5KEw3Fhh7ldkb-e--RJx7hNAM8r3tBpn_rj8l7m7dUpTRsIiVS-GYk9eDG_BH9UNZzs0ru-f-Cy8VuV7KzPOPLLO0X1GDqi_dDgx_tUAsS0fpr60O_Xa5aMKAui3SqCIYgdbmlzwqjeoMSUxbarr2sAeG0vwVYX2VktE5QtKAI4pz0D0KubDby0dmVM0bUtNwAU"
                />
              </div>
              <h3 className="font-bold">Mini Rex</h3>
            </div>

            <div className="group relative cursor-pointer rounded-lg bg-surface-container-high p-6">
              <div className="relative mb-4 aspect-square overflow-hidden rounded-[1rem]">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  alt="Wooly sheep fibers"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAV2g1__lVrnKH_oegEFmdgJUi6VNjcoZzI6ImDeTwXXXRJdLqEgRCFJGvyAn3tIOCvsTWssUDdq9HslXrebJKLNmn6lioEeGhkUlXzVpzJhP2NMtXR4fOnrIKULgLzju0C5r5HipDSAS8Ur4JyDcHveb07cfyHJlTwoxaonQv6iP7j9Z6QMitC8WE4dmipPKIgHhp5S8m7MH-JvZlZcEH1fKHAkgW4xkdnemb9IYYtokUl1abY4zcbpD_UK8SGsehG4CPRVwVN30"
                />
              </div>
              <h3 className="font-bold">Wooly Sheep</h3>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-24">
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-16 space-y-4 text-center">
              <h2 className="font-headline text-5xl font-black tracking-tight">Seasonal Drops</h2>
              <p className="mx-auto max-w-2xl text-lg text-secondary">Limited-time designs inspired by the world around us. Once they are gone, they are gone.</p>
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="space-y-6">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl nocturnal-shadow">
                  <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover" alt="Autumn harvest collection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0Rf5ik-TAvFHBoXXQlHC4kohAeucldwEhzHUcXutTFjM4xTlps2UV7mgDkqTrngwypl2kladNDNLUmsDwp2ECKP_JY3rLkVpevoYHUc1cBNDzxq5withBqsGz99ZFXDt_4du-es1RZPIcPpCRzZyaOSiAQkwBsYZVg6v7sR_HbwLcHCQJRZptNVLVKUydfjjw6ohM5cx4_s8ww1G_DlwOJZ9-bhSMMfTLq7qEdSAaPdP0FxcvEgkrg8Ccn_UPJ9iaQ36Ox3qcs98" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Autumn Harvest</h3>
                  <p className="mt-2 text-secondary">Warm tones and cozy vibes</p>
                </div>
              </div>
              <div className="mt-12 space-y-6 md:mt-24">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl nocturnal-shadow">
                  <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover" alt="Winter solstice collection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfaTpDh2vkd3b6PsM7vByCoZR5nYYVqFGiC2g7EqcAmrmVO_Pu7KvxbSWLTnnDCDV8eEsueNVYbYXuw11T9xFrylH3nc3eGUn-oUn-651VFaPZlmfnVsCHJjoNa1vjTZ3fqHMdvx1jtUIHXRMFS0UEeMe7uLrU4S2QfRg1Vfyj4fqmAYPgQKFut-DBb9Wxw5KGq4Pkx2E3Hi_iLMaF7IzxIJ_nGyPKry5H3VuycT-wI7re7KdUoB0xbHiecZ8rwujYCmHe2arHAn4" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Winter Solstice</h3>
                  <p className="mt-2 text-secondary">Crisp whites and deep blues</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl nocturnal-shadow">
                  <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover" alt="Spring bloom collection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHKZR3BKakk7HBOgPwfokKZGddOZ8m6koRZ2nCGNwo2SWxqmCCSZU4qIBqlla45SP1G9zdiA7c9MOFbQ1Fa_eKBnqTvYuBlX4s3St9LgVexX4XZoFNJb983sc9KOi20Fsasi6R0xUJPEqK2QVKV-kAJSCeunv17OcQu6joqZLQ0zQXHqSQtkHe-68WBUNCaKaHpg-09L0R1VGwcPeqagmyOuNGgPwd7ICsLXTefFCpPeYGRYr88l2g6segcZs69SLcw9_r8YDLw_M" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Spring Bloom</h3>
                  <p className="mt-2 text-secondary">Floral patterns and pastel pals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8">
          <div className="mb-12 flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="font-headline text-4xl font-black tracking-tight">Explore the Full Collection</h2>
              <p className="text-secondary">Our complete catalog of handcrafted wonders.</p>
            </div>
            <a href="#" className="font-bold text-primary underline-offset-4 hover:underline">View All</a>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Cinder the Dragon",
                tag: "Limited",
                subtitle: "Pokemon Inspired",
                price: 145000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBz5sLJkZ5A8PysdtiSgSfXmY2JeihENjtQRKHC_Sx9fSRXDKVD8kSgT8WEH5Wwj4RgRBiQU871mD115YBuEvPwO32b_itz564sxRg8XqpcYfG4RSguGN3GhJOtPr-UyRZJUEnXtwi7hSGtl1mce-sbQdpmISXeumIVXGMDGSA-vtUSa7caODvUeEDDwJLkASQRsWE8tGIxeHfzmjmCc6p2Jp_b9R-bGO07TjyVyPQcYouA_YEGZaYqy-nVcbiJ9ZQEDVQcmwXH2Kc",
                badgeClass: "bg-primary text-on-primary",
              },
              {
                name: "Boo-Tie Phantom",
                tag: "Best Seller",
                subtitle: "Gothic Kawaii",
                price: 45000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRg4o01OaUs-Bpfpx6Xrr8aGW8VALFQDxzhqAmqvptgRG9FRCuLbxeG6AInrhKYu9P7bBFQtK7ugcnVWjYjPEWgYF8WF8ork7DIgqgdnPchTd_Q5pDMrHFsMEuvrD6IbMPLZIxfHzn2p2AZpUZqk6omgUcNZdT9uI8KksjNLPCRU3mITrCmED-nkjbmACUV5caaBUd1BD2eklB-s7ffxCdgJqh-Xz2zapGn7kswVG4gknZbroPYHRqTdpfG2kuiMPdDczJ4IAFCJ4",
                badgeClass: "bg-tertiary-container text-on-tertiary",
              },
              {
                name: "Living Yarn Succulent",
                tag: "",
                subtitle: "Evergreens",
                price: 38000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ290JZ48hZykPxsQHaYuax42cb3jnmbv_1yaskresansUluKqfgamwmpAZOUmeABn42dxtITVnpq3oBZemrYriY9Q4SCqQ2PEFcdBEVKLieRy65pdlvtaaX995FCaKBri_WREOqSi84Q0GhqC1IVLKx3tA25tJluaqr1hbkpwMzCGAm6JXyqU_sVkVXZbwzOIEBI3edWvlNh1ORaS-kykFUXNB_9OWXUecgBw_QtfD_FsGMvPe4g4BoW2oxo9Ty_KoxxWIHCsvn0",
                badgeClass: "",
              },
              {
                name: "Leviathan Cloud",
                tag: "Rare Piece",
                subtitle: "Ocean Dreams",
                price: 55000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAglfVkphFTU2bt12IQ6bewMfk0dzpSx5t35jkWhBn9N7ZrFzrmSbQ9lO0O9lJbr0cNtyHKMqVztva4-gYFuQAGnjQIupYqThPR6vQjTXgCEr0ryv7bRlmUi9EBoCWI2-ly6wW6G0U4uIEO7RC-1MyNqh9MNEQVMTHYer8Tdc2J5_Tx_dGg5KCBD4Ij4L1dBQsvA6CYTfxZ4LyFjrW3q3usHRvIoklynj2AuSqtzK4BlGJAD_FXw5HrgeKD-FSl0KsjAMq5MB-QhMQ",
                badgeClass: "bg-on-background text-surface",
              },
            ].map((item) => (
              <article key={item.name} className="group">
                <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-surface-container-low transition-transform duration-500 group-hover:-translate-y-2">
                  <Image fill sizes="(max-width: 768px) 100vw, 25vw" className="h-full w-full object-cover" alt={item.name} src={item.image} />
                  {item.tag ? (
                    <div className="absolute left-4 top-4">
                      <span className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${item.badgeClass}`}>{item.tag}</span>
                    </div>
                  ) : null}
                  <button className="absolute bottom-4 right-4 translate-y-4 rounded-full bg-surface-container-lowest p-3 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-label={`Add ${item.name} to cart`}>
                    +
                  </button>
                </div>
                <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-primary">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-secondary">{item.subtitle}</p>
                  <p className="text-lg font-black text-on-background">{formatCurrency(item.price as number)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="mx-auto max-w-7xl space-y-8 rounded-xl bg-primary p-12 text-center md:p-20">
            <h2 className="font-headline mx-auto max-w-2xl text-4xl font-black tracking-tight text-on-primary md:text-5xl">Start Your Own Custom Collection Today</h2>
            <p className="mx-auto max-w-xl text-lg text-primary-fixed-dim">Join 10,000+ creators who have designed their own handmade companions.</p>
            <div className="mx-auto flex max-w-md flex-col justify-center gap-4 md:flex-row">
              <input className="w-full rounded-full bg-surface-container-lowest px-8 py-4 text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-on-primary" type="email" placeholder="Enter your email" />
              <button className="whitespace-nowrap rounded-full bg-on-surface px-8 py-4 font-bold text-surface transition-all hover:bg-secondary-fixed-dim">Join The Club</button>
            </div>
          </div>
        </section>
      </div>

      <button className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-on-primary shadow-2xl transition-all hover:bg-primary-container active:scale-95" aria-label="Open customizer">
        P
      </button>
    </div>
  );
}
