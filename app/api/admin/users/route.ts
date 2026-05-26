import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.INSFORGE_API_KEY!, // Use API key (service role) to bypass RLS
});

export async function GET(request: NextRequest) {
    try {
        console.log('[Admin Users API] Fetching reviews...');

        // Fetch all reviews with user data
        const { data: reviews, error: reviewsError } = await insforge.database
            .from('reviews')
            .select('*');

        if (reviewsError) {
            console.error('[Admin Users API] Error fetching reviews:', reviewsError);
            return NextResponse.json(
                { error: 'Failed to fetch reviews', details: reviewsError },
                { status: 500 }
            );
        }

        console.log(`[Admin Users API] Found ${reviews?.length || 0} reviews`);

        // Aggregate user data from reviews
        const userMap = new Map<string, any>();

        reviews?.forEach((review: any) => {
            const userId = review.user_id;

            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    user_id: userId,
                    name: review.full_name,
                    email: null,
                    phone: null,
                    total_reviews: 0,
                    total_spent: 0,
                    last_active: review.created_at,
                    review_statuses: [],
                    linkedin_urls: [],
                    purposes: [],
                    job_titles: [],
                    professional_statuses: [],
                    overall_scores: [],
                });
            }

            const userData = userMap.get(userId);
            userData.total_reviews += 1;
            userData.review_statuses.push(review.status);
            userData.linkedin_urls.push(review.linkedin_url);
            userData.purposes.push(review.purpose);
            userData.professional_statuses.push(review.professional_status);

            if (review.current_job_title) {
                userData.job_titles.push(review.current_job_title);
            }

            if (review.overall_score) {
                userData.overall_scores.push(review.overall_score);
            }

            // Calculate total spent based on payment status
            if (review.payment_status === 'completed') {
                userData.total_spent += 49; // Base review price
            }

            // Track rewrite orders
            if (review.rewrite_payment_status === 'completed') {
                userData.total_spent += 29; // Rewrite price
            }

            // Update last active date
            if (new Date(review.created_at) > new Date(userData.last_active)) {
                userData.last_active = review.created_at;
            }
        });

        console.log(`[Admin Users API] Aggregated ${userMap.size} unique users`);

        // Try to fetch user profiles from auth system
        const userIds = Array.from(userMap.keys());

        // Fetch email from auth.users table using RPC function (bypasses schema restrictions)
        try {
            console.log('[Admin Users API] Querying user emails via RPC, userIds:', userIds);

            const { data: authUsers, error: authError } = await insforge.database
                .rpc('get_user_emails', { user_ids: userIds });

            console.log('[Admin Users API] RPC query result:', {
                authUsersCount: authUsers?.length,
                authUsers: JSON.stringify(authUsers, null, 2),
                authError
            });

            if (authError) {
                console.error('[Admin Users API] Error fetching emails via RPC:', authError);
            } else if (authUsers && authUsers.length > 0) {
                console.log(`[Admin Users API] Fetched ${authUsers.length} user emails`);
                authUsers.forEach((authUser: any) => {
                    console.log(`[Admin Users API] Mapping email for ${authUser.id}: ${authUser.email}`);
                    const userData = userMap.get(authUser.id);
                    if (userData) {
                        userData.email = authUser.email || null;
                        console.log(`[Admin Users API] Set email for ${authUser.id} to: ${userData.email}`);
                    }
                });
            } else {
                console.warn('[Admin Users API] No user emails found or empty result');
            }
        } catch (err) {
            console.error('[Admin Users API] Exception fetching emails:', err);
        }

        // Fetch profiles for each user (if available)
        for (const userId of userIds) {
            try {
                const { data: profile, error: profileError } = await insforge.auth.getProfile(userId);

                if (profileError) {
                    console.warn(`[Admin Users API] Profile error for ${userId}:`, profileError);
                    continue;
                }

                if (profile) {
                    console.log(`[Admin Users API] Profile for ${userId}:`, JSON.stringify(profile, null, 2));

                    const userData = userMap.get(userId);

                    // Profile structure: { id, profile: { name, phone, ... } }
                    if (profile.profile) {
                        const profileData = profile.profile as any;
                        userData.phone = profileData.phone || null;
                        if (profileData.name) {
                            userData.name = profileData.name;
                        }
                    }
                }
            } catch (err) {
                console.warn(`[Admin Users API] Could not fetch profile for user ${userId}`);
            }
        }

        const users = Array.from(userMap.values()).sort((a, b) =>
            new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
        );

        console.log(`[Admin Users API] Returning ${users.length} users`);
        return NextResponse.json({ users });
    } catch (error) {
        console.error('[Admin Users API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
