export default function Footer() {
    return (
        <footer className="w-full rounded-t-2xl bg-surface-container-low">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-12 py-16 md:grid-cols-4">
                <div className="space-y-6">
                    <a href="#" className="font-headline text-xl font-black text-on-surface">Florlen</a>
                    <p className="text-sm text-secondary">Handcrafting the future of collectibles, one stitch at a time. Designed by you, handmade with love.</p>
                </div>
                <div>
                    <h4 className="mb-6 font-bold">Shop</h4>
                    <ul className="space-y-4 text-sm text-secondary">
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Custom Studio</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">All Collections</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Limited Editions</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Gift Cards</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="mb-6 font-bold">Company</h4>
                    <ul className="space-y-4 text-sm text-secondary">
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Our Story</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Sustainability</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="mb-6 font-bold">Support</h4>
                    <ul className="space-y-4 text-sm text-secondary">
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Care Guide</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Shipping Info</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Privacy Policy</a></li>
                        <li><a className="transition-all duration-300 hover:text-primary hover:underline" href="#">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-surface-container-high px-12 py-8 text-sm text-secondary md:flex-row">
                <p>Copyright 2024 Florlen. Handmade with love.</p>
                <p>Designed for collectors.</p>
            </div>
        </footer>
    );
}
