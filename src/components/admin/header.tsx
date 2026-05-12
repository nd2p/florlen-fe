import {
    IconBell,
    IconHelpCircle,
    IconSearch,
    IconSettings,
} from "@tabler/icons-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-30 border-b border-transparent bg-surface/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full max-w-xl">
                    <IconSearch
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary"
                        stroke={2}
                    />
                    <input
                        type="search"
                        aria-label="Search orders and customers"
                        placeholder="Search orders, customers..."
                        className="h-14 w-full rounded-full bg-surface-container-highest pl-12 pr-5 text-sm text-on-surface outline-none transition-all placeholder:text-secondary/70 focus:ring-2 focus:ring-primary"
                    />
                </label>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="flex items-center gap-2">
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-highest text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Notifications">
                            <IconBell className="h-5 w-5" stroke={2} />
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-highest text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Settings">
                            <IconSettings className="h-5 w-5" stroke={2} />
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-highest text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Help">
                            <IconHelpCircle className="h-5 w-5" stroke={2} />
                        </button>
                    </div>

                    <button className="flex items-center gap-3 rounded-full bg-surface-container-highest px-2 py-2 pr-4 text-left transition-colors hover:bg-surface-container-high">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                            A
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-semibold text-secondary">Logged in as</p>
                            <p className="text-sm font-bold text-on-surface">Admin</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
