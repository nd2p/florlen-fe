"use client";

import { useMemo, useState } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    createCollection,
    uploadCollectionImages,
} from "@/lib/api/collection.api";

const CreateCollectionSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    slug: z.string().min(1, { message: "Slug is required." }),
    description: z.string().optional(),
    collection_type: z.enum(["seasonal", "fandom", "event_drop", "permanent"]),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    is_active: z.boolean(),
    is_featured: z.boolean(),
});

type CreateCollectionValues = z.infer<typeof CreateCollectionSchema>;

type CreateCollectionDialogProps = {
    onCreated?: () => void;
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const toIsoString = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

export default function CreateCollectionDialog({ onCreated }: CreateCollectionDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateCollectionValues>({
        resolver: zodResolver(CreateCollectionSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            collection_type: "seasonal",
            starts_at: "",
            ends_at: "",
            is_active: true,
            is_featured: false,
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const nameValue = watch("name");
    const generatedSlug = useMemo(() => slugify(nameValue || ""), [nameValue]);

    const nameRegister = register("name", {
        onChange: (event) => {
            const nextName = event.target.value as string;
            const currentSlug = getValues("slug");
            const previousName = getValues("name");
            const previousSlug = slugify(previousName || "");
            if (!currentSlug || currentSlug === previousSlug) {
                setValue("slug", slugify(nextName), { shouldValidate: true });
            }
        },
    });

    const onSubmit = async (values: CreateCollectionValues) => {
        const toastId = toast.loading("Creating collection...");

        try {
            let coverUrl: string | null = null;
            let bannerUrl: string | null = null;

            if (coverFile) {
                const uploaded = await uploadCollectionImages([coverFile]);
                coverUrl = uploaded[0]?.url || null;
            }

            if (bannerFile) {
                const uploaded = await uploadCollectionImages([bannerFile]);
                bannerUrl = uploaded[0]?.url || null;
            }

            await createCollection({
                name: values.name.trim(),
                slug: values.slug.trim(),
                description: values.description?.trim() || undefined,
                collection_type: values.collection_type,
                is_active: values.is_active,
                is_featured: values.is_featured,
                starts_at: toIsoString(values.starts_at) || undefined,
                ends_at: toIsoString(values.ends_at) || undefined,
                cover_image_url: coverUrl || undefined,
                banner_image_url: bannerUrl || undefined,
            });

            toast.success("Collection created.", { id: toastId });
            reset();
            setCoverFile(null);
            setBannerFile(null);
            setOpen(false);
            onCreated?.();
            router.refresh();
        } catch (error) {
            console.error("Create collection error:", error);
            const message = error instanceof Error ? error.message : "Failed to create collection.";
            toast.error(message, { id: toastId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" size="md" type="button" className="rounded-full px-5 py-3 text-sm">
                    <IconPlus className="h-4 w-4 shrink-0" stroke={2} />
                    New Collection
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new collection</DialogTitle>
                    <DialogDescription>
                        Upload cover or banner images first, then the dialog will submit the returned URLs.
                    </DialogDescription>
                </DialogHeader>

                <Form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-8">
                        <section className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Name"
                                id="collection-name"
                                placeholder="Summer Drop 2026"
                                error={errors.name?.message}
                                {...nameRegister}
                            />
                            <Input
                                label="Slug"
                                id="collection-slug"
                                placeholder={generatedSlug || "summer-drop-2026"}
                                helperText="Used in URLs and internal lookup."
                                error={errors.slug?.message}
                                {...register("slug")}
                            />
                            <div className="space-y-2">
                                <label
                                    htmlFor="collection-type"
                                    className="ml-1 block text-sm font-headline font-bold text-on-surface"
                                >
                                    Collection Type
                                </label>
                                <select
                                    id="collection-type"
                                    {...register("collection_type")}
                                    className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                                >
                                    <option value="seasonal">Seasonal</option>
                                    <option value="fandom">Fandom</option>
                                    <option value="event_drop">Event Drop</option>
                                    <option value="permanent">Permanent</option>
                                </select>
                            </div>
                            <Input
                                label="Start"
                                id="collection-start"
                                type="datetime-local"
                                error={errors.starts_at?.message}
                                {...register("starts_at")}
                            />
                            <Input
                                label="End"
                                id="collection-end"
                                type="datetime-local"
                                error={errors.ends_at?.message}
                                {...register("ends_at")}
                            />
                        </section>

                        <section className="space-y-2">
                            <label
                                htmlFor="collection-description"
                                className="ml-1 block text-sm font-headline font-bold text-on-surface"
                            >
                                Description
                            </label>
                            <textarea
                                id="collection-description"
                                rows={4}
                                placeholder="Short summary for the collection page."
                                className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                                {...register("description")}
                            />
                        </section>

                        <section className="grid gap-4 md:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-secondary">
                                <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                    <Checkbox {...register("is_active")} defaultChecked />
                                    <span className="absolute inset-0 rounded-sm bg-surface-container-highest ring-1 ring-transparent transition peer-checked:bg-primary-fixed peer-checked:ring-primary-fixed" />
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 12 10"
                                        className="relative h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 5L4.2 8L11 1.5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <span>Active</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-secondary">
                                <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                    <Checkbox {...register("is_featured")} />
                                    <span className="absolute inset-0 rounded-sm bg-surface-container-highest ring-1 ring-transparent transition peer-checked:bg-primary-fixed peer-checked:ring-primary-fixed" />
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 12 10"
                                        className="relative h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 5L4.2 8L11 1.5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <span>Featured</span>
                            </label>
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div>
                                <h3 className="font-headline text-lg font-black text-on-surface">Cover Image</h3>
                                <p className="text-sm text-secondary">Optional. Upload a wide cover for listings.</p>
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                                className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container"
                            />
                            {coverFile ? (
                                <p className="text-sm text-secondary">{coverFile.name}</p>
                            ) : null}
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div>
                                <h3 className="font-headline text-lg font-black text-on-surface">Banner Image</h3>
                                <p className="text-sm text-secondary">Optional. Upload a hero banner for the page.</p>
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(event) => setBannerFile(event.target.files?.[0] || null)}
                                className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container"
                            />
                            {bannerFile ? (
                                <p className="text-sm text-secondary">{bannerFile.name}</p>
                            ) : null}
                        </section>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setOpen(false)}
                            className="rounded-full px-6 py-3 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={isSubmitting}
                            className="rounded-full px-6 py-3 text-sm"
                        >
                            {isSubmitting ? "Creating..." : "Create Collection"}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
