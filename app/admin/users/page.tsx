'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
    user_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    total_reviews: number;
    total_spent: number;
    last_active: string;
    review_statuses: string[];
    linkedin_urls: string[];
    purposes: string[];
    job_titles: string[];
    professional_statuses: string[];
    overall_scores: number[];
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'last_active' | 'total_reviews' | 'total_spent'>('last_active');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.phone?.includes(search) ||
            user.linkedin_urls.some(url => url.toLowerCase().includes(search))
        );
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortBy === 'last_active') {
            return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
        } else if (sortBy === 'total_reviews') {
            return b.total_reviews - a.total_reviews;
        } else {
            return b.total_spent - a.total_spent;
        }
    });

    const getAverageScore = (scores: number[]) => {
        if (scores.length === 0) return 'N/A';
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg.toFixed(1);
    };

    const getCompletedReviews = (statuses: string[]) => {
        return statuses.filter(s => s === 'completed').length;
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold">Users Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                {users.length} total users
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/rewrites')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                        >
                            ← Back to Rewrites
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold mt-1">{users.length}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold mt-1">
                                ${users.reduce((sum, u) => sum + u.total_spent, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Total Reviews</p>
                            <p className="text-2xl font-bold mt-1">
                                {users.reduce((sum, u) => sum + u.total_reviews, 0)}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Avg Reviews/User</p>
                            <p className="text-2xl font-bold mt-1">
                                {users.length > 0
                                    ? (users.reduce((sum, u) => sum + u.total_reviews, 0) / users.length).toFixed(1)
                                    : '0'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or LinkedIn URL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-border rounded-lg bg-background"
                        >
                            <option value="last_active">Sort by Last Active</option>
                            <option value="total_reviews">Sort by Total Reviews</option>
                            <option value="total_spent">Sort by Total Spent</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="text-center py-12">Loading users...</div>
                ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Reviews
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Avg Score
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Last Active
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sortedUsers.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-muted/50">
                                            <td className="px-4 py-4">
                                                <div className="font-medium">{user.name || 'N/A'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.professional_statuses[0] || 'N/A'}
                                                </div>
                                                {user.job_titles.length > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.job_titles[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">{user.email || 'N/A'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium">{user.total_reviews}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getCompletedReviews(user.review_statuses)} completed
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium">
                                                    ${user.total_spent.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium">
                                                    {getAverageScore(user.overall_scores)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    {new Date(user.last_active).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(user.last_active).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {sortedUsers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
