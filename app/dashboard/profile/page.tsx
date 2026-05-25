"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { insforge } from "@/lib/auth/insforge";
import { auth } from "@/firebase";
import {
    ConfirmationResult,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2Icon, User, Phone, Mail, ChevronDownIcon, Check, X, Shield, ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, refreshSession } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });
    const [selectedCountry, setSelectedCountry] = useState("+91");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // OTP verification states
    const [phoneChanged, setPhoneChanged] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const countries = [
        { code: "+91", flag: "🇮🇳", name: "India" },
        { code: "+1", flag: "🇺🇸", name: "United States" },
        { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
        { code: "+61", flag: "🇦🇺", name: "Australia" },
        { code: "+86", flag: "🇨🇳", name: "China" },
        { code: "+81", flag: "🇯🇵", name: "Japan" },
        { code: "+49", flag: "🇩🇪", name: "Germany" },
        { code: "+33", flag: "🇫🇷", name: "France" },
        { code: "+55", flag: "🇧🇷", name: "Brazil" },
        { code: "+971", flag: "🇦🇪", name: "UAE" },
    ];

    const selectedCountryData = countries.find(c => c.code === selectedCountry);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    // Initialize form data from user profile
    useEffect(() => {
        if (user?.profile) {
            const phone = user.profile.phone || "";
            const name = user.profile.name || user.name || "";

            // Extract country code from phone
            let countryCode = "+91";
            let phoneNumber = "";

            if (phone) {
                const found = countries.find(c => phone.startsWith(c.code));
                if (found) {
                    countryCode = found.code;
                    phoneNumber = phone.replace(found.code, "");
                } else {
                    phoneNumber = phone;
                }
            }

            setFormData({ name, phone: phoneNumber });
            setSelectedCountry(countryCode);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowCountryDropdown(false);
        };

        if (showCountryDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showCountryDropdown]);

    // Initialize RecaptchaVerifier
    useEffect(() => {
        let verifier: RecaptchaVerifier | null = null;

        try {
            verifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                { size: "invisible" }
            );
            setRecaptchaVerifier(verifier);
        } catch (error) {
            console.error("Failed to initialize RecaptchaVerifier:", error);
        }

        return () => {
            if (verifier) {
                verifier.clear();
            }
        };
    }, []);

    // Resend OTP countdown
    useEffect(() => {
        if (resendCountdown === 0) return;

        const timer = setTimeout(() => {
            setResendCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendCountdown]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);

        // Detect if phone number changed
        if (field === 'phone') {
            const currentPhone = user?.profile?.phone || "";
            const newPhone = `${selectedCountry}${value.replace(/\s/g, '')}`;
            setPhoneChanged(newPhone !== currentPhone);
            // Reset OTP state when phone changes
            if (otpSent) {
                setOtpSent(false);
                setOtp("");
                setConfirmationResult(null);
            }
        }
    };

    const sendOtp = async () => {
        if (!formData.phone || formData.phone.length < 8) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsSendingOtp(true);

        try {
            const fullPhoneNumber = `${selectedCountry}${formData.phone.replace(/\s/g, '')}`;
            const verifier = recaptchaVerifier;

            if (!verifier) {
                throw new Error("reCAPTCHA not initialized");
            }

            const result = await signInWithPhoneNumber(
                auth,
                fullPhoneNumber,
                verifier
            );

            setConfirmationResult(result);
            setOtpSent(true);
            setResendCountdown(60);
            toast.success("OTP sent successfully!");
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            toast.error(error.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        setIsVerifyingOtp(true);

        try {
            await confirmationResult!.confirm(otp);
            toast.success("Phone number verified!");
            // OTP verified, ready to save
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
            toast.error(error.message || "Invalid OTP. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const resendOtp = async () => {
        if (resendCountdown > 0) return;
        await sendOtp();
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            // If phone changed, verify OTP first
            if (phoneChanged && !otpSent) {
                toast.error("Please verify your new phone number with OTP");
                setIsSaving(false);
                return;
            }

            if (phoneChanged && otpSent && otp.length < 6) {
                toast.error("Please enter the OTP to verify your phone number");
                setIsSaving(false);
                return;
            }

            // If OTP was sent, verify it first
            if (otpSent && confirmationResult) {
                try {
                    await confirmationResult.confirm(otp);
                    toast.success("Phone number verified!");
                } catch (error: any) {
                    console.error("Error verifying OTP:", error);
                    toast.error(error.message || "Invalid OTP. Please try again.");
                    setIsSaving(false);
                    return;
                }
            }

            const fullPhone = formData.phone ? `${selectedCountry}${formData.phone.replace(/\s/g, '')}` : "";

            const updates: Record<string, string> = {};
            if (formData.name.trim()) updates.name = formData.name.trim();
            if (fullPhone) updates.phone = fullPhone;

            const { data, error } = await insforge.auth.setProfile(updates);

            if (error) {
                throw error;
            }

            toast.success("Profile updated successfully!");
            setIsEditing(false);
            setHasChanges(false);
            setPhoneChanged(false);
            setOtpSent(false);
            setOtp("");
            setConfirmationResult(null);

            // Refresh session to update AuthContext
            await refreshSession();
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data
        if (user?.profile) {
            const phone = user.profile.phone || "";
            const name = user.profile.name || user.name || "";

            let phoneNumber = "";
            if (phone) {
                const found = countries.find(c => phone.startsWith(c.code));
                phoneNumber = found ? phone.replace(found.code, "") : phone;
            }

            setFormData({ name, phone: phoneNumber });
        }
        setIsEditing(false);
        setHasChanges(false);
        setPhoneChanged(false);
        setOtpSent(false);
        setOtp("");
        setConfirmationResult(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => router.push("/dashboard")}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <div className="h-6 w-px bg-gray-300" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                                    <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
                                </div>
                            </div>
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)}>
                                    <User className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 space-y-6">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                {user.profile?.avatar_url || user.avatar_url ? (
                                    <img
                                        src={user.profile?.avatar_url || user.avatar_url}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-10 h-10 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user.profile?.name || user.name || "User"}
                                    </h2>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Signed up via {user.provider || 'OAuth'}
                                    </p>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            className="max-w-md"
                                        />
                                    ) : (
                                        <p className="text-gray-900">
                                            {user.profile?.name || user.name || "Not set"}
                                        </p>
                                    )}
                                </div>

                                {/* Email (Read-only) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <p className="text-gray-900">{user.email}</p>
                                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex gap-2 max-w-md">
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCountryDropdown(!showCountryDropdown);
                                                        }}
                                                        className="h-10 px-3 flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <span className="text-lg">{selectedCountryData?.flag}</span>
                                                        <ChevronDownIcon className="w-3 h-3 text-gray-600" />
                                                    </button>

                                                    {showCountryDropdown && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                                                        >
                                                            {countries.map((country) => (
                                                                <button
                                                                    key={country.code}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCountry(country.code);
                                                                        setShowCountryDropdown(false);
                                                                    }}
                                                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <span className="text-lg">{country.flag}</span>
                                                                    <span className="flex-1 text-left text-sm">{country.name}</span>
                                                                    <span className="text-sm text-gray-600">{country.code}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <Input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    placeholder="9876543210"
                                                    className="flex-1"
                                                />
                                            </div>

                                            {/* OTP Verification UI */}
                                            {phoneChanged && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md">
                                                    <div className="flex items-start gap-3">
                                                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-amber-900">
                                                                    Phone verification required
                                                                </p>
                                                                <p className="text-xs text-amber-700 mt-1">
                                                                    We need to verify your new phone number with an OTP
                                                                </p>
                                                            </div>

                                                            {!otpSent ? (
                                                                <Button
                                                                    onClick={sendOtp}
                                                                    disabled={isSendingOtp || !formData.phone}
                                                                    size="sm"
                                                                    className="w-full"
                                                                >
                                                                    {isSendingOtp ? (
                                                                        <>
                                                                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                                                            Sending OTP...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Phone className="w-4 h-4 mr-2" />
                                                                            Send OTP
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-xs text-green-700">
                                                                        <Check className="w-4 h-4" />
                                                                        OTP sent successfully
                                                                    </div>

                                                                    <InputOTP
                                                                        maxLength={6}
                                                                        value={otp}
                                                                        onChange={setOtp}
                                                                    >
                                                                        <InputOTPGroup>
                                                                            <InputOTPSlot index={0} />
                                                                            <InputOTPSlot index={1} />
                                                                            <InputOTPSlot index={2} />
                                                                        </InputOTPGroup>
                                                                        <InputOTPSeparator />
                                                                        <InputOTPGroup>
                                                                            <InputOTPSlot index={3} />
                                                                            <InputOTPSlot index={4} />
                                                                            <InputOTPSlot index={5} />
                                                                        </InputOTPGroup>
                                                                    </InputOTP>

                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            onClick={verifyOtp}
                                                                            disabled={isVerifyingOtp || otp.length < 6}
                                                                            size="sm"
                                                                            className="flex-1"
                                                                        >
                                                                            {isVerifyingOtp ? (
                                                                                <>
                                                                                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                                                                    Verifying...
                                                                                </>
                                                                            ) : (
                                                                                'Verify OTP'
                                                                            )}
                                                                        </Button>
                                                                        <Button
                                                                            onClick={resendOtp}
                                                                            disabled={resendCountdown > 0}
                                                                            variant="outline"
                                                                            size="sm"
                                                                        >
                                                                            {resendCountdown > 0
                                                                                ? `Resend (${resendCountdown}s)`
                                                                                : 'Resend'
                                                                            }
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-900">
                                            {user.profile?.phone || "Not set"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="space-y-4 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">User ID</p>
                                        <p className="text-gray-900 font-mono text-xs mt-1">{user.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Email Verified</p>
                                        <p className="text-gray-900 mt-1">
                                            {user.emailVerified ? (
                                                <span className="text-green-600 font-medium">✓ Verified</span>
                                            ) : (
                                                <span className="text-red-600 font-medium">✗ Not Verified</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Created At</p>
                                        <p className="text-gray-900 mt-1">
                                            {new Date(user.createdAt || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Last Updated</p>
                                        <p className="text-gray-900 mt-1">
                                            {new Date(user.updatedAt || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
            <div id="recaptcha-container"></div>
        </>
    );
}
