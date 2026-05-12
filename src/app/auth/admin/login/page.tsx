import type { ReactNode } from "react";
import { IconId, IconLock, IconShieldLock, IconUserShield } from "@tabler/icons-react";

function FieldIcon({ children }: { children: ReactNode }) {
    return (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
            {children}
        </span>
    );
}

export default function AdminLoginPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-on-background sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-12 h-80 w-80 -translate-x-1/2 rounded-full bg-surface-container-low opacity-80 blur-3xl" />
                <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-primary-fixed opacity-30 blur-2xl" />
                <div className="absolute right-[10%] top-[22%] h-28 w-28 rounded-full bg-surface-container-highest opacity-70 blur-3xl" />
                <div className="absolute bottom-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-primary-fixed-dim opacity-25 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-105 flex-col items-center justify-between gap-8 py-4 sm:py-8">
                <header className="pt-2 text-center">
                    <a href="/" className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                        Florlen
                    </a>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-secondary sm:text-[0.75rem]">
                        Administrative Access
                    </p>
                </header>

                <section className="w-full rounded-4xl bg-surface-container-lowest px-6 py-7 text-center nocturnal-shadow sm:px-8 sm:py-8">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-semibold text-on-primary-fixed shadow-[0_10px_24px_-14px_rgba(164,0,21,0.55)]">
                        <IconShieldLock className="h-3.5 w-3.5" stroke={2} />
                        <span>Secure Portal</span>
                    </div>

                    <div className="mt-6 space-y-2">
                        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-[2rem]">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-secondary sm:text-[0.95rem]">
                            Please authenticate to manage the collection
                        </p>
                    </div>

                    <form className="mt-8 space-y-4 text-left">
                        <div className="space-y-2">
                            <label htmlFor="admin-id" className="ml-1 text-sm font-medium text-on-surface">
                                Admin ID or Email
                            </label>
                            <div className="relative">
                                <FieldIcon>
                                    <IconId className="h-4 w-4" stroke={1.9} />
                                </FieldIcon>
                                <input
                                    id="admin-id"
                                    name="admin-id"
                                    type="text"
                                    defaultValue=""
                                    placeholder="Enter credentials"
                                    className="h-11 w-full rounded-2xl bg-surface-container-highest px-12 text-sm text-on-surface outline-none transition-all placeholder:text-secondary/55 focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <label htmlFor="admin-password" className="ml-1 text-sm font-medium text-on-surface">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover">
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative">
                                <FieldIcon>
                                    <IconLock className="h-4 w-4" stroke={1.9} />
                                </FieldIcon>
                                <input
                                    id="admin-password"
                                    name="admin-password"
                                    type="password"
                                    defaultValue=""
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-2xl bg-surface-container-highest px-12 text-sm tracking-[0.22em] text-on-surface outline-none transition-all placeholder:tracking-normal placeholder:text-secondary/55 focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 px-1 pt-1 text-sm text-secondary">
                            <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                <input
                                    type="checkbox"
                                    name="remember-session"
                                    className="peer sr-only"
                                    defaultChecked
                                />
                                <span className="absolute inset-0 rounded-sm bg-surface-container-highest ring-1 ring-transparent transition peer-checked:bg-primary-fixed peer-checked:ring-primary-fixed" />
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 12 10"
                                    className="relative h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                    fill="none"
                                >
                                    <path d="M1 5L4.2 8L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span>Keep session active for 8 hours</span>
                        </label>

                        <button
                            type="button"
                            className="mt-2 h-12 w-full rounded-full bg-primary px-6 font-headline text-base font-extrabold text-on-primary shadow-[0_18px_34px_-18px_rgba(164,0,21,0.8)] transition-all duration-200 hover:bg-primary-hover active:scale-[0.99]"
                        >
                            Authorize Entry
                        </button>
                    </form>

                    <div className="mt-8 h-px w-full bg-surface-container-high/80" />

                    <p className="mx-auto mt-7 max-w-xs text-center text-xs leading-6 text-secondary">
                        Authorized personnel only. All access attempts are logged and monitored. IP address tracking is active.
                    </p>
                </section>

                <footer className="flex flex-col items-center gap-4 pb-2 text-sm text-secondary sm:flex-row sm:gap-5">
                    <a href="#" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
                        <IconUserShield className="h-4 w-4" stroke={1.8} />
                        <span>Contact System Administrator</span>
                    </a>
                </footer>

                <div className="fixed inset-x-0 bottom-0 z-0 border-t border-surface-container-high/80 bg-surface-container-low px-5 py-4 text-sm text-secondary sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 md:flex-row md:justify-between">
                        <a href="/" className="font-headline font-extrabold text-on-surface">
                            Florlen
                        </a>
                        <p className="text-center text-xs sm:text-sm">© 2024 Florlen. Artfully Crocheted AI Designs.</p>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <a href="#" className="transition-colors hover:text-primary">
                                Privacy Policy
                            </a>
                            <a href="#" className="transition-colors hover:text-primary">
                                Terms of Service
                            </a>
                            <a href="#" className="transition-colors hover:text-primary">
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
