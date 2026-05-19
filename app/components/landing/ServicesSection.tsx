const services = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        iconBg: "bg-blue-100",
        iconColor: "text-[#0052CC]",
        title: "AI Profile Review",
        description: "Get a detailed score from 1-100 based on 9 critical sections. Receive personalized feedback and a prioritized action plan.",
        features: ["9-section breakdown", "Strengths & improvement areas", "3-5 actionable suggestions"],
        badge: null,
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        iconBg: "bg-yellow-100",
        iconColor: "text-[#FFB800]",
        title: "Expert Rewrite by Manish",
        description: "Manish personally rewrites your LinkedIn profile. Headline, About, Experience bullets — all optimized for recruiter attention.",
        features: ["Delivered in 2-3 business days", "1 revision round included", "Personalized to your goals"],
        badge: "PREMIUM",
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        iconBg: "bg-green-100",
        iconColor: "text-[#36B37E]",
        title: "Dynamic Calibration",
        description: "AI scoring adapts to your experience level and goals. Students, job seekers, and executives are evaluated differently.",
        features: ["Occupation-aware scoring", "Experience-level weighting", "Purpose-driven feedback"],
        badge: null,
    },
];

export default function ServicesSection() {
    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172B4D]">
                        Comprehensive Career Services
                    </h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                        Everything you need to optimize your LinkedIn presence and land your dream role
                    </p>
                </div>

                {/* Service Cards */}
                <div className="mt-10 sm:mt-12 md:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl border p-6 sm:p-8 transition-shadow hover:shadow-lg ${service.badge
                                ? "border-2 border-[#FFB800] bg-gradient-to-b from-yellow-50 to-white relative"
                                : "border-[#DFE1E6] bg-white"
                                }`}
                        >
                            {/* Badge */}
                            {service.badge && (
                                <div className="absolute -top-3 right-4 sm:right-6 rounded-full bg-[#FFB800] px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-white">
                                    {service.badge}
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`mb-4 inline-flex items-center justify-center rounded-lg ${service.iconBg} p-2.5 sm:p-3`}>
                                <div className={`${service.iconColor} h-5 w-5 sm:h-6 sm:w-6`}>{service.icon}</div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg sm:text-xl font-semibold text-[#172B4D]">{service.title}</h3>
                            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#6B778C]">{service.description}</p>

                            {/* Features */}
                            <ul className="mt-3 sm:mt-4 space-y-2">
                                {service.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center gap-2 text-xs sm:text-sm text-[#6B778C]">
                                        <span className="text-[#36B37E]">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
