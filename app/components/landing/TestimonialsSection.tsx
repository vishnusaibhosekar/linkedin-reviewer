const testimonials = [
    {
        name: "Priya Sharma",
        role: "Senior Product Manager at Google",
        content: "Scored 62/100 initially. After implementing the suggestions and getting Manish's rewrite, my profile views increased 5x. Got 3 recruiter calls in the first week.",
        rating: 5,
    },
    {
        name: "Rahul Verma",
        role: "Software Engineer at Microsoft",
        content: "The breakdown was incredibly detailed. I realized my headline was only stating my job title — Manish helped me craft one with keywords that actually matter.",
        rating: 5,
    },
    {
        name: "Ananya Reddy",
        role: "Recent CS Graduate, IIT Delhi",
        content: "As a student with no experience, I didn't know what a 'good' LinkedIn looked like. The score report gave me a clear roadmap. Landed my first internship within a month!",
        rating: 5,
    },
];

export default function TestimonialsSection() {
    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172B4D]">
                        What Users Say
                    </h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                        Real feedback from professionals who optimized their LinkedIn profiles
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="mt-10 sm:mt-12 md:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="rounded-2xl border border-[#DFE1E6] bg-white p-6 sm:p-8">
                            {/* Stars */}
                            <div className="flex items-center gap-1 text-[#FFAB00]">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Content */}
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#6B778C]">{testimonial.content}</p>

                            {/* Author */}
                            <div className="mt-4 sm:mt-6 border-t border-[#DFE1E6] pt-3 sm:pt-4">
                                <div className="text-sm sm:text-base font-semibold text-[#172B4D]">{testimonial.name}</div>
                                <div className="text-xs sm:text-sm text-[#6B778C]">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
