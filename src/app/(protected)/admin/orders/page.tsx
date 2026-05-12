import {
    IconAlertTriangle,
    IconArrowRight,
    IconCalendar,
    IconChevronDown,
    IconDownload,
    IconFilter,
} from "@tabler/icons-react";

type OrderStatus = "Processing" | "Stitched" | "Shipped";

type OrderItem = {
    id: string;
    customer: string;
    date: string;
    items: number;
    status: OrderStatus;
    total: string;
    avatars: string[];
};

const orders: OrderItem[] = [
    {
        id: "#3",
        customer: "Eleanor Shellstrop",
        date: "Oct 24, 2023",
        items: 2,
        status: "Processing",
        total: "$145.00",
        avatars: ["ES", "PT"],
    },
    {
        id: "#2",
        customer: "Chidi Anagonye",
        date: "Oct 23, 2023",
        items: 1,
        status: "Stitched",
        total: "$85.00",
        avatars: ["CA"],
    },
    {
        id: "#1",
        customer: "Tahani Al-Jamil",
        date: "Oct 22, 2023",
        items: 3,
        status: "Shipped",
        total: "$320.00",
        avatars: ["TA", "MJ", "KA"],
    },
];

function statusStyles(status: OrderStatus) {
    switch (status) {
        case "Processing":
            return "bg-primary-fixed text-on-primary-fixed";
        case "Stitched":
            return "bg-surface-container-highest text-on-surface";
        case "Shipped":
            return "bg-surface-container-high text-secondary";
    }
}

export default function OrdersPage() {
    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
                            Order Management
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            Review, update, and manage customer plushie orders.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest">
                        <IconCalendar className="h-4 w-4 text-secondary" stroke={2} />
                        Last 30 Days
                        <IconChevronDown className="h-4 w-4 text-secondary" stroke={2} />
                    </button>
                    <button className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest">
                        <IconFilter className="h-4 w-4 text-secondary" stroke={2} />
                        All Statuses
                        <IconChevronDown className="h-4 w-4 text-secondary" stroke={2} />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-container" aria-label="Download orders">
                        <IconDownload className="h-5 w-5" stroke={2} />
                    </button>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-4">
                    {orders.map((order) => (
                        <article
                            key={order.id}
                            className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)] transition-transform hover:-translate-y-0.5"
                        >
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-sm font-black text-primary">
                                            {order.id}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-on-surface sm:text-xl">{order.customer}</h2>
                                            <p className="text-sm text-secondary">
                                                {order.date} · {order.items} Item{order.items > 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {order.avatars.map((avatar, index) => (
                                            <div
                                                key={`${order.id}-${avatar}`}
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-low text-[11px] font-bold text-on-primary shadow-sm ${index === 0 ? "bg-primary" : index === 1 ? "bg-secondary" : "bg-primary-container"
                                                    } ${index > 0 ? "-ml-2" : ""}`}
                                            >
                                                {avatar}
                                            </div>
                                        ))}
                                        {order.avatars.length > 0 ? (
                                            <span className="rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-secondary">
                                                +{order.items}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-row items-start justify-between gap-4 sm:min-w-40 sm:flex-col sm:items-end sm:text-right">
                                    <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${statusStyles(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <div>
                                        <p className="text-sm text-secondary">Total</p>
                                        <p className="text-2xl font-black text-on-surface">{order.total}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <aside className="space-y-4">
                    <section className="rounded-[1.5rem] bg-primary p-5 text-on-primary shadow-[0_28px_60px_-40px_rgba(164,0,21,0.6)]">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg font-black">Today&apos;s Queue</p>
                                <p className="mt-1 text-sm text-primary-fixed-dim">Live production pressure at a glance.</p>
                            </div>
                            <span className="rounded-full bg-surface-container-lowest/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-on-primary">
                                Live
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-fixed-dim">To Stitch</p>
                                <p className="mt-2 text-4xl font-black">12</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-fixed-dim">To Ship</p>
                                <p className="mt-2 text-4xl font-black">8</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
                        <h2 className="text-lg font-black text-on-surface">Urgent Actions</h2>

                        <div className="mt-4 rounded-[1.25rem] bg-surface-container-lowest p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
                                    <IconAlertTriangle className="h-5 w-5" stroke={2} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-on-surface">Order #1038 Delayed</p>
                                    <p className="mt-1 text-sm text-secondary">Awaiting crimson yarn restock.</p>
                                </div>

                                <button className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary transition-colors hover:bg-surface-container-highest" aria-label="Open delayed order details">
                                    <IconArrowRight className="h-5 w-5" stroke={2} />
                                </button>
                            </div>
                        </div>
                    </section>
                </aside>
            </section>
        </div>
    );
}
