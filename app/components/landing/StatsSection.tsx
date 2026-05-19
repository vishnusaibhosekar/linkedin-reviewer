const stats = [
    { value: "500+", label: "Profile Reviews" },
    { value: "<5 min", label: "Score Delivery" },
    { value: "9 Sections", label: "Detailed Analysis" },
    { value: "4.5/5", label: "User Satisfaction" },
];

export default function StatsSection() {
    return (
        <section className="border-y border-[#DFE1E6] bg-[#F4F5F7] py-10 sm:py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0052CC]">{stat.value}</div>
                            <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-[#6B778C]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
