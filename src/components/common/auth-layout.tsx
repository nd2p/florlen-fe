import { ReactNode } from "react";
import Image from "next/image";
import FeatureCard from "./feature-card";

interface AuthLayoutProps {
    children: ReactNode;
    showBranding?: boolean;
}

export default function AuthLayout({ children, showBranding = true }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen pt-16 flex-col lg:flex-row overflow-hidden">
            {/* Left Side: Visual Showcase */}
            {showBranding && (
                <section className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-primary relative overflow-hidden">
                    {/* Branding Section */}
                    <div className="relative z-10">
                        <h1 className="text-on-primary font-headline text-4xl font-extrabold tracking-tight mb-4">
                            Florlen
                        </h1>
                        <p className="text-on-primary font-body text-xl max-w-xs opacity-90 leading-relaxed">
                            Join our exclusive circle of artfully crocheted collectibles and designer plushies.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 space-y-6">
                        <FeatureCard
                            icon="verified_user"
                            title="World of Craftsmanship"
                            description="Discover a curated collection of meticulously handcrafted crochet patterns and plushies, designed by artisans and collectors alike."
                        />
                    </div>

                    {/* Decorative Shapes */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-container rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 -left-10 w-40 h-40 bg-on-primary-container/10 rounded-full blur-3xl"></div>

                    {/* Background Image */}
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                        <Image
                            alt="Macro close-up of crimson red crochet patterns"
                            className="object-cover"
                            fill
                            sizes="50vw"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCW5bw7l6hIU0oRtOSZFh5WSY1R4iDyTdDhnQg7tbtYjS4VHPodJR4EOV5AUFX1w0p4646GZoXkh8w6LoH5zm_SAVyyTxCoxfTuY-dsb10Q1CrmXCbFQPsjJnJyVn5mfKVXEewm41c_iWhhgfZExQCtSOHZmczCRsRMrusD9P9mY5WfUCnqurT9JOt3J8Dcqe3dtRfj71P3YEtfRS86kk7CjQRPil4Q4dneNtW_V_jKVPcm76A4l9lTEMZASLv2UfNqw0c0QTQxlU"
                        />
                    </div>
                </section>
            )}

            {/* Right Side: Form Content */}
            <section className={`flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface ${showBranding ? "lg:w-1/2" : "w-full"}`}>
                {children}
            </section>
        </main>
    );
}
