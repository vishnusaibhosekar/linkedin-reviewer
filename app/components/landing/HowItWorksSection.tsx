import Link from "next/link";

const steps = [
    {
        number: "01",
        title: "Sign Up & Login",
        description: "Quick authentication via WhatsApp OTP or email. No passwords to remember.",
    },
    {
        number: "02",
        title: "Submit Your Profile",
        description: "Fill out a quick intake form, upload your LinkedIn PDF and 3+ screenshots.",
    },
    {
        number: "03",
        title: "Make Payment",
        description: "Secure payment via Razorpay (India) or Stripe (International). Receipt emailed instantly.",
    },
    {
        number: "04",
        title: "Get Your Score",
        description: "AI analyzes your profile and delivers a comprehensive score report in under 5 minutes.",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="scroll-mt-20 sm:scroll-mt-24 bg-[#F4F5F7] py-12 sm:py-8 md:py-12 lg:py-20 xl:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172B4D]">
                        Simple 4-Step Process
                    </h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6B778C]">
                        From sign-up to score report in under 5 minutes
                    </p>
                </div>

                {/* Steps */}
                <div className="mt-10 sm:mt-12 md:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-[#0052CC] text-xl sm:text-2xl font-bold text-white">
                                {step.number}
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#172B4D]">{step.title}</h3>
                            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#6B778C]">{step.description}</p>

                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-6 sm:top-8 left-full hidden w-full lg:block">
                                    <div className="mx-4 h-0.5 bg-[#DFE1E6]" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-8 sm:mt-10 md:mt-12 text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0052CC] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-[#0747A6] transition-colors"
                    >
                        Start Your Review →
                    </Link>
                </div>
            </div>
        </section>
    );
}
