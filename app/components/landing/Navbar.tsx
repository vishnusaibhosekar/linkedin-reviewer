import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-[#DFE1E6] bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between">
                    <Logo size="md" />

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="/auth/login"
                            className="rounded-lg bg-[#0052CC] px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0747A6] transition-colors"
                        >
                            Get My Score
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
