import Link from "next/link";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    href?: string;
    className?: string;
}

const sizeConfig = {
    sm: {
        container: "h-8 w-8",
        icon: "h-4 w-4",
        text: "text-base",
    },
    md: {
        container: "h-9 w-9",
        icon: "h-5 w-5",
        text: "text-lg",
    },
    lg: {
        container: "h-12 w-12",
        icon: "h-7 w-7",
        text: "text-xl",
    },
};

export default function Logo({
    size = "md",
    showText = true,
    href = "/",
    className = ""
}: LogoProps) {
    const config = sizeConfig[size];

    const LogoIcon = (
        <div className={`flex ${config.container} items-center justify-center rounded-lg bg-[#0052CC]`}>
            <svg className={`${config.icon} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );

    const LogoText = showText && (
        <span className={`${config.text} font-semibold text-[#172B4D]`}>
            Career Cube - LinkedIn Reviewer
        </span>
    );

    const Content = (
        <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
            {LogoIcon}
            {LogoText}
        </div>
    );

    if (href) {
        return <Link href={href}>{Content}</Link>;
    }

    return Content;
}
