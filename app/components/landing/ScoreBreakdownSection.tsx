const scoreSections = [
    { name: "Profile Photo & Banner", points: 10 },
    { name: "Headline", points: 15 },
    { name: "About / Summary", points: 15 },
    { name: "Work Experience", points: 20 },
    { name: "Education", points: 8 },
    { name: "Skills & Endorsements", points: 8 },
    { name: "Recommendations", points: 10 },
    { name: "Achievements & Licenses", points: 7 },
    { name: "Activity & Recent Posts", points: 7 },
];

export default function ScoreBreakdownSection() {
    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172B4D]">
                        What You'll Get in Your Score Report
                    </h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                        A comprehensive breakdown across 9 critical LinkedIn sections
                    </p>
                </div>

                {/* Score Cards */}
                <div className="mt-10 sm:mt-12 md:mt-16 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {scoreSections.map((section, index) => (
                        <div key={index} className="rounded-xl border border-[#DFE1E6] bg-white p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-semibold text-[#172B4D]">{section.name}</h3>
                                <span className="rounded-full bg-blue-100 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium text-[#0052CC]">
                                    {section.points} pts
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Score Box */}
                <div className="mt-8 sm:mt-10 md:mt-12 rounded-2xl bg-[#F4F5F7] p-6 sm:p-8 text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-[#0052CC]">100</div>
                    <div className="mt-2 text-base sm:text-lg font-medium text-[#172B4D]">Total Points</div>
                    <div className="mt-1 text-xs sm:text-sm text-[#6B778C]">
                        Each section scored based on best practices vetted by Manish Maryada
                    </div>
                </div>
            </div>
        </section>
    );
}
