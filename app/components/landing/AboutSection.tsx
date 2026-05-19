export default function AboutSection() {
    return (
        <section className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Text Content */}
                        <div>
                            <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-blue-100 px-3 py-1.5 sm:px-4 sm:py-2">
                                <span className="text-xs sm:text-sm font-medium text-[#0052CC]">Your Expert</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172B4D]">
                                Hi, I'm Manish Maryada
                            </h2>
                            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                                Ex-Founder, YC Alum, Forbes 30 Under 30. I've reviewed hundreds of LinkedIn profiles
                                and helped professionals land roles at top companies.
                            </p>
                            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                                I built this scoring rubric based on what actually gets recruiter attention — not generic advice.
                                Every AI review is calibrated to my standards, and for the premium rewrite, I personally
                                craft your profile to maximize impact.
                            </p>

                            {/* Credibility Badges */}
                            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                                <div className="rounded-lg bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                                    <div className="text-xl sm:text-2xl font-bold text-[#0052CC]">YC</div>
                                    <div className="text-[10px] sm:text-xs text-[#6B778C]">Alumni</div>
                                </div>
                                <div className="rounded-lg bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                                    <div className="text-xl sm:text-2xl font-bold text-[#0052CC]">Forbes</div>
                                    <div className="text-[10px] sm:text-xs text-[#6B778C]">30 Under 30</div>
                                </div>
                                <div className="rounded-lg bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                                    <div className="text-xl sm:text-2xl font-bold text-[#0052CC]">500+</div>
                                    <div className="text-[10px] sm:text-xs text-[#6B778C]">Reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Image Placeholder */}
                        <div className="flex items-center justify-center order-first lg:order-last mb-6 lg:mb-0">
                            <div className="h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 rounded-2xl bg-gradient-to-br from-[#0052CC] to-[#0747A6] flex items-center justify-center text-white text-6xl sm:text-7xl md:text-8xl font-bold shadow-xl">
                                M
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
