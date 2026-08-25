import React, { useRef, ChangeEvent } from "react";
import Link from "next/link";
import { FaImage, FaArrowRight, FaUpload } from "react-icons/fa";

export default function VisualSearchSection(): React.JSX.Element {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleButtonClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("Selected file:", file);
        }
    };

    return (
        <section className="my-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-surface p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FaImage />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-primary">
                    Visual search
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    See something you love? Search by image.
                </h2>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
                    Upload a product photo and ShopNest can help you discover visually similar products
                    across the marketplace.
                </p>
                <Link
                    href="/products"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-indigo-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                    Explore visual search <FaArrowRight />
                </Link>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-indigo-50/70 p-7 dark:bg-slate-900 sm:p-9">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/10" />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="relative flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-indigo-200 bg-white/80 p-8 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/50">
                    <FaImage className="text-4xl text-indigo-600 dark:text-indigo-400" />
                    <p className="mt-4 font-bold text-slate-900 dark:text-white">Drop an image here</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">AI-powered product discovery</p>

                    <button
                        type="button"
                        onClick={handleButtonClick}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <FaUpload /> Upload Image
                    </button>
                </div>
            </div>
        </section>
    );
}