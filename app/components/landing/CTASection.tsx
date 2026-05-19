import Link from "next/link";

export default function CTASection() {
    return (
        <section className="bg-gradient-to-br from-[#0052CC] to-[#0747A6] py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                        Ready to Optimize Your LinkedIn Profile?
                    </h2>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100">
                        Join 500+ professionals who've already improved their LinkedIn presence.
                        Get your personalized score report in under 5 minutes.
                    </p>
                    <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                        <Link
                            href="/auth/login"
                            className="w-full sm:w-auto rounded-xl bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#0052CC] hover:bg-blue-50 transition-colors shadow-lg text-center"
                        >
                            Get My LinkedIn Score →
                        </Link>
                    </div>
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-blue-200">
                        Score delivery in &lt;5 min • Optional expert rewrite available
                    </p>
                </div>
            </div>
        </section>
    );
}
