/**
 * Region detection for geographic pricing
 * Determines if user is from India or International (US/other)
 */

export type CustomerRegion = 'IN' | 'US';

/**
 * Detect user's region based on IP geolocation
 * Falls back to browser locale if API fails
 */
export async function detectUserRegion(): Promise<CustomerRegion> {
    try {
        // Try IP-based detection first
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.country_code === 'IN') {
                return 'IN';
            }
        }
    } catch (error) {
        console.warn('[Region Detection] IP API failed, falling back to browser locale:', error);
    }

    // Fallback: browser locale detection
    const locale = navigator.language || navigator.languages?.[0] || '';
    if (locale.includes('IN') || locale.includes('hi')) {
        return 'IN';
    }

    // Default to international pricing
    return 'US';
}

/**
 * Get pricing display info for a region
 */
export function getPricingInfo(region: CustomerRegion, type: 'review' | 'rewrite') {
    const isIndianCustomer = region === 'IN';

    return {
        region,
        currency: isIndianCustomer ? 'INR' : 'USD',
        currencySymbol: isIndianCustomer ? '₹' : '$',
        reviewPrice: isIndianCustomer
            ? parseFloat(process.env.NEXT_PUBLIC_DODO_REVIEW_PRICE_IN || '99')
            : parseFloat(process.env.NEXT_PUBLIC_DODO_REVIEW_PRICE_US || '4.99'),
        rewritePrice: isIndianCustomer
            ? parseFloat(process.env.NEXT_PUBLIC_DODO_REWRITE_PRICE_IN || '499')
            : parseFloat(process.env.NEXT_PUBLIC_DODO_REWRITE_PRICE_US || '19.99'),
        price: type === 'review'
            ? isIndianCustomer
                ? parseFloat(process.env.NEXT_PUBLIC_DODO_REVIEW_PRICE_IN || '99')
                : parseFloat(process.env.NEXT_PUBLIC_DODO_REVIEW_PRICE_US || '4.99')
            : isIndianCustomer
                ? parseFloat(process.env.NEXT_PUBLIC_DODO_REWRITE_PRICE_IN || '499')
                : parseFloat(process.env.NEXT_PUBLIC_DODO_REWRITE_PRICE_US || '19.99'),
    };
}
