'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Play,
    FileText,
    TrendingUp,
    Calendar,
    LogOut,
    X,
    Loader2,
    ExternalLink,
    Star,
    Target,
    Lightbulb,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface RewriteOrder {
    id: string;
    user_id: string;
    review_id: string;
    status: string;
    resume_storage_path: string;
    key_accomplishments: string;
    target_roles: string;
    tone_preference: string;
    sections_to_improve: string[];
    special_requests: string;
    contact_email: string;
    deliverable_path: string;
    assigned_to: string;
    created_at: string;
    due_date: string;
    completed_at: string;
}

interface CategoryScore {
    score: number;
    weight: number;
    findings: string[];
    recommendations: string[];
}

interface ReviewData {
    id: string;
    user_id: string;
    full_name: string;
    professional_status: string;
    work_experience: string;
    current_job_title: string;
    purpose: string;
    overall_score: number;
    score_band: string;
    category_scores: {
        profile_photo_banner: CategoryScore;
        headline: CategoryScore;
        about_summary: CategoryScore;
        work_experience: CategoryScore;
        education: CategoryScore;
        skills_endorsements: CategoryScore;
        recommendations: CategoryScore;
        achievements_licenses: CategoryScore;
        activity_posts: CategoryScore;
    };
    recommendations: Array<{
        priority: string;
        category: string;
        action: string;
        impact: string;
    }>;
    strengths: string[];
    weaknesses: string[];
    pdf_storage_path: string;
    screenshot_paths: string[];
    created_at: string;
}

export default function AdminRewritesPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<RewriteOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<RewriteOrder | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/rewrites?status=${filter}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setOrders(data.orders);
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            const response = await fetch('/api/admin/rewrites', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (response.ok) {
                toast.success('Status updated successfully');
                fetchOrders();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeliverableUpload = async (orderId: string, file: File) => {
        setUploadingOrderId(orderId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orderId', orderId);

            const uploadResponse = await fetch('/api/admin/upload-deliverable', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                toast.error('Failed to upload deliverable');
                return;
            }

            const { storagePath } = await uploadResponse.json();

            // Update order with deliverable path and mark as completed
            const updateResponse = await fetch('/api/admin/rewrites', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: 'completed',
                    deliverablePath: storagePath
                }),
            });

            if (updateResponse.ok) {
                toast.success('Deliverable uploaded and order marked as completed');
                fetchOrders();
            } else {
                toast.error('Failed to update order');
            }
        } catch (error) {
            toast.error('Failed to upload deliverable');
        } finally {
            setUploadingOrderId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; icon: any; label: string }> = {
            'pending_payment': { bg: 'bg-gray-100 text-gray-700 border border-gray-200', icon: Clock, label: 'Pending Payment' },
            'in_progress': { bg: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Play, label: 'In Progress' },
            'completed': { bg: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2, label: 'Completed' },
            'cancelled': { bg: 'bg-red-50 text-red-700 border border-red-200', icon: AlertCircle, label: 'Cancelled' }
        };

        const { bg, icon: Icon, label } = config[status] || config['pending_payment'];

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'completed' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            toast.success('Logged out successfully');
            router.push('/admin/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const handleViewDetails = async (order: RewriteOrder) => {
        setLoadingReview(true);
        setViewModalOpen(true);
        setSelectedReview(null); // Reset previous data
        setSelectedOrder(order); // Store the order data
        try {
            console.log('Fetching review for order:', order.review_id);
            const response = await fetch(`/api/reviews/${order.review_id}`);
            const data = await response.json();
            console.log('Review API response:', response.status, data);

            if (response.ok && data.success) {
                setSelectedReview(data.review);
            } else {
                console.error('Failed to fetch review:', data.error || 'Unknown error');
                toast.error(data.error || 'Failed to fetch review details');
            }
        } catch (error) {
            console.error('Error fetching review:', error);
            toast.error('Failed to fetch review details');
        } finally {
            setLoadingReview(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 90) return 'bg-green-50 border-green-200';
        if (score >= 75) return 'bg-blue-50 border-blue-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        if (score >= 40) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header with Logout */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Rewrite Orders
                                </h1>
                                <p className="text-sm sm:text-base text-gray-500 mt-0.5">Manage and track all rewrite requests</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {orders.filter(o => o.status === 'pending_payment').length}
                                </p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {orders.filter(o => o.status === 'in_progress').length}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Play className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {orders.filter(o => o.status === 'completed').length}
                                </p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
                    {['all', 'pending_payment', 'in_progress', 'completed'].map((status) => {
                        const isActive = filter === status;
                        const icons = {
                            'all': TrendingUp,
                            'pending_payment': Clock,
                            'in_progress': Play,
                            'completed': CheckCircle2
                        };
                        const Icon = icons[status as keyof typeof icons];

                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${isActive
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        );
                    })}
                </div>

                {/* Orders Container */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-12 sm:p-16 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No orders found</p>
                            <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers submit requests</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Customer</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Target Roles</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Created</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Due Date</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                            {order.contact_email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">{order.contact_email}</div>
                                                            <div className="text-sm text-gray-500 mt-0.5">
                                                                {order.target_roles.split(',').slice(0, 2).join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm text-gray-900 font-medium">{order.target_roles}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-2">
                                                        {getStatusBadge(order.status)}
                                                        {order.due_date && isOverdue(order.due_date, order.status) && (
                                                            <div className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                Overdue
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className={order.due_date && isOverdue(order.due_date, order.status) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                            {order.due_date ? formatDate(order.due_date) : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        {order.status === 'pending_payment' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                                                                disabled={updatingOrderId === order.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-medium shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Play className="w-3.5 h-3.5" />
                                                                Start
                                                            </button>
                                                        )}
                                                        {order.status === 'in_progress' && (
                                                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-xs font-medium shadow-sm shadow-green-500/20 cursor-pointer transition-all">
                                                                <Download className="w-3.5 h-3.5" />
                                                                {uploadingOrderId === order.id ? 'Uploading...' : 'Complete'}
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,.docx"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) handleDeliverableUpload(order.id, file);
                                                                    }}
                                                                    disabled={uploadingOrderId === order.id}
                                                                />
                                                            </label>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewDetails(order)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-4 sm:p-6 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {order.contact_email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 truncate">{order.contact_email}</div>
                                                <div className="text-sm text-gray-500 mt-0.5">
                                                    {order.target_roles.split(',').slice(0, 2).join(', ')}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </div>
                                        {order.due_date && isOverdue(order.due_date, order.status) && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Overdue
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wide">Target Roles</div>
                                            <div className="text-sm text-gray-900 font-medium">{order.target_roles}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wide flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Created
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">{formatDate(order.created_at)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wide flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Due Date
                                                </div>
                                                <div className={`text-xs sm:text-sm ${order.due_date && isOverdue(order.due_date, order.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                    {order.due_date ? formatDate(order.due_date) : '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {order.status === 'pending_payment' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                                                    disabled={updatingOrderId === order.id}
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Play className="w-4 h-4" />
                                                    Start
                                                </button>
                                            )}
                                            {order.status === 'in_progress' && (
                                                <label className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-green-500/20 cursor-pointer transition-all">
                                                    <Download className="w-4 h-4" />
                                                    {uploadingOrderId === order.id ? 'Uploading...' : 'Complete'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.docx"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleDeliverableUpload(order.id, file);
                                                        }}
                                                        disabled={uploadingOrderId === order.id}
                                                    />
                                                </label>
                                            )}
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* View Review Details Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">AI scoring analysis and feedback</p>
                            </div>
                            <button
                                onClick={() => {
                                    setViewModalOpen(false);
                                    setSelectedReview(null);
                                    setSelectedOrder(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {loadingReview ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <p className="ml-3 text-gray-600">Loading review details...</p>
                                </div>
                            ) : selectedReview ? (
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                                        <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Name</p>
                                                <p className="font-medium text-gray-900">{selectedReview.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <p className="font-medium text-gray-900 capitalize">{selectedReview.professional_status}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Experience</p>
                                                <p className="font-medium text-gray-900">{selectedReview.work_experience} years</p>
                                            </div>
                                            {selectedReview.current_job_title && (
                                                <div>
                                                    <p className="text-gray-500">Current Role</p>
                                                    <p className="font-medium text-gray-900">{selectedReview.current_job_title}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-500">Purpose</p>
                                                <p className="font-medium text-gray-900">{selectedReview.purpose}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Score */}
                                    <div className={`border-2 rounded-xl p-6 ${getScoreBg(selectedReview.overall_score)}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Overall Score</h3>
                                                <div className="flex items-baseline gap-3">
                                                    <span className={`text-5xl font-bold ${getScoreColor(selectedReview.overall_score)}`}>
                                                        {selectedReview.overall_score}
                                                    </span>
                                                    <span className="text-xl text-gray-600">/100</span>
                                                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border">
                                                        {selectedReview.score_band}
                                                    </span>
                                                </div>
                                            </div>
                                            <Star className={`w-12 h-12 ${getScoreColor(selectedReview.overall_score)}`} />
                                        </div>
                                    </div>

                                    {/* Strengths & Weaknesses */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {selectedReview.strengths && selectedReview.strengths.length > 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                                    <Star className="w-4 h-4" />
                                                    Strengths ({selectedReview.strengths.length})
                                                </h3>
                                                <ul className="space-y-2">
                                                    {selectedReview.strengths.map((strength, idx) => (
                                                        <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                                            <span className="text-green-600 mt-1">•</span>
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedReview.weaknesses && selectedReview.weaknesses.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Areas for Improvement ({selectedReview.weaknesses.length})
                                                </h3>
                                                <ul className="space-y-2">
                                                    {selectedReview.weaknesses.map((weakness, idx) => (
                                                        <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                                            <span className="text-red-600 mt-1">•</span>
                                                            {weakness}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Scores */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Category Scores (9 Sections)
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(selectedReview.category_scores || {}).map(([key, category]) => {
                                                const sectionName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                const scorePercent = (category.score / 100) * category.weight;
                                                const isExpanded = expandedSections[key];

                                                return (
                                                    <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => toggleSection(key)}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <span className="font-medium text-sm text-gray-900">{sectionName}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBg(category.score)} ${getScoreColor(category.score)}`}>
                                                                    {category.score}/100
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${getScoreColor(category.score).replace('text-', 'bg-')}`}
                                                                        style={{ width: `${category.score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                                                                    {scorePercent.toFixed(1)}/{category.weight}
                                                                </span>
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </div>
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                                                                {category.findings && category.findings.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Findings</h4>
                                                                        <ul className="space-y-1.5">
                                                                            {category.findings.map((finding, idx) => (
                                                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                                                    <span className="text-blue-600 mt-1">•</span>
                                                                                    {finding}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {category.recommendations && category.recommendations.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Recommendations</h4>
                                                                        <ul className="space-y-1.5">
                                                                            {category.recommendations.map((rec, idx) => (
                                                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                                                    <Lightbulb className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                                    {rec}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* AI Recommendations */}
                                    {selectedReview.recommendations && selectedReview.recommendations.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Lightbulb className="w-5 h-5" />
                                                Prioritized Action Plan
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedReview.recommendations.map((rec, idx) => (
                                                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="font-medium text-sm text-gray-900">{rec.category}</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {rec.priority} priority
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 ml-8">{rec.action}</p>
                                                        <p className="text-xs text-gray-500 ml-8 mt-1">Expected impact: {rec.impact}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Uploaded Files */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Uploaded Files
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-sm text-gray-900 mb-2">LinkedIn Profile PDF</h4>
                                                <p className="text-xs text-gray-500 mb-3 break-all">{selectedReview.pdf_storage_path}</p>
                                                <button
                                                    onClick={() => window.open(`/api/rewrites/download?userId=${selectedReview.user_id}&path=${encodeURIComponent(selectedReview.pdf_storage_path)}`, '_blank')}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    View PDF
                                                </button>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-sm text-gray-900 mb-2">Resume</h4>
                                                <p className="text-xs text-gray-500 mb-3 break-all">{selectedOrder?.resume_storage_path || 'N/A'}</p>
                                                <button
                                                    onClick={() => window.open(`/api/rewrites/download?userId=${selectedReview.user_id}&path=${encodeURIComponent(selectedOrder?.resume_storage_path || '')}`, '_blank')}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    View Resume
                                                </button>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-4 mt-4">
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Screenshots ({selectedReview.screenshot_paths?.length || 0})</h4>
                                            <p className="text-xs text-gray-500 mb-3">Profile photos, skills, recommendations, activity</p>
                                            <div className="space-y-2">
                                                {selectedReview.screenshot_paths?.map((path, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => window.open(`/api/rewrites/download?userId=${selectedReview.user_id}&path=${encodeURIComponent(path)}`, '_blank')}
                                                        className="w-full inline-flex items-center justify-between px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        <span className="text-gray-700 truncate">Screenshot {idx + 1}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <p className="text-gray-600">Failed to load review details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
