import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function Footer() {
    return (
        <footer className="border-t border-[#DFE1E6] bg-white py-8 sm:py-10 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Logo size="md" href="/" />
                        <p className="mt-3 sm:mt-4 max-w-sm text-xs sm:text-sm text-[#6B778C]">
                            AI-powered LinkedIn profile scoring with expert credibility.
                            Get personalized feedback and optional rewrite by Manish Maryada.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-[#172B4D]">Quick Links</h3>
                        <ul className="mt-3 sm:mt-4 space-y-2">
                            <li>
                                <Link href="/auth/login" className="text-xs sm:text-sm text-[#6B778C] hover:text-[#0052CC] transition-colors">
                                    Get Your Score
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-xs sm:text-sm text-[#6B778C] hover:text-[#0052CC] transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-[#172B4D]">Contact</h3>
                        <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-[#6B778C]">
                            <li>manish@linkedinreviewer.com</li>
                            <li>WhatsApp Support</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 sm:mt-10 md:mt-12 border-t border-[#DFE1E6] pt-6 sm:pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-xs sm:text-sm text-[#6B778C]">
                            © {new Date().getFullYear()} LinkedIn Reviewer. All rights reserved.
                        </p>
                        <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-[#6B778C]">
                            <Link href="#" className="hover:text-[#0052CC] transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="hover:text-[#0052CC] transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
