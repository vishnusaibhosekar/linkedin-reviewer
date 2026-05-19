import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Badge */}
                    <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-blue-100 px-3 py-1.5 sm:px-4 sm:py-2">
                        <span className="text-xs sm:text-sm font-medium text-[#0052CC]">
                            Vetted by Manish Maryada — YC Alum, Forbes 30 Under 30
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#172B4D]">
                        Get Your LinkedIn Profile Scored
                        <span className="block text-[#0052CC]">Out of 100</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed sm:leading-8 text-[#6B778C]">
                        AI-powered analysis with expert credibility. Get a personalized score, detailed breakdown,
                        and actionable improvements — all in under 5 minutes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                        <Link
                            href="/auth/login"
                            className="w-full sm:w-auto rounded-xl bg-[#0052CC] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-[#0747A6] transition-colors shadow-lg shadow-blue-500/25 text-center"
                        >
                            Get My LinkedIn Score →
                        </Link>
                        <a
                            href="#how-it-works"
                            className="w-full sm:w-auto rounded-xl border-2 border-[#DFE1E6] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#172B4D] hover:border-[#0052CC] hover:text-[#0052CC] transition-colors text-center"
                        >
                            See How It Works
                        </a>
                    </div>

                    {/* Trust Signal */}
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-[#6B778C]">
                        Trusted by 500+ professionals • Score delivered in &lt;5 min
                    </p>
                </div>
            </div>
        </section>
    );
}
