'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Save, Loader2 } from 'lucide-react';
import LinkedInProfileView from './LinkedInProfileView';

interface ProfileData {
    name: string;
    headline: string;
    about: string;
    location: string;
    connections: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: string[];
    achievements: AchievementEntry[];
    recommendations: string[];
}

export interface LinkedInProfilePreviewRef {
    getProfileData: () => ProfileData;
}

interface ExperienceEntry {
    title: string;
    company: string;
    duration: string;
    description: string;
}

interface EducationEntry {
    school: string;
    degree: string;
    field: string;
    year: string;
}

interface AchievementEntry {
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

interface LinkedInProfilePreviewProps {
    initialData?: Partial<ProfileData>;
    onSave?: (data: ProfileData) => void;
    isSaving?: boolean;
    hideSaveButton?: boolean;
}

const LinkedInProfilePreview = forwardRef<LinkedInProfilePreviewRef, LinkedInProfilePreviewProps>(function LinkedInProfilePreview({
    initialData,
    onSave,
    isSaving = false,
    hideSaveButton = false
}, ref) {
    const [profileData, setProfileData] = useState<ProfileData>({
        name: initialData?.name || '',
        headline: initialData?.headline || '',
        about: initialData?.about || '',
        location: initialData?.location || '',
        connections: initialData?.connections || '500+',
        experience: initialData?.experience || [],
        education: initialData?.education || [],
        skills: initialData?.skills || [],
        achievements: initialData?.achievements || [],
        recommendations: initialData?.recommendations || [],
    });

    // Expose profileData to parent via ref
    useImperativeHandle(ref, () => ({
        getProfileData: () => profileData,
    }));

    const handleSave = () => {
        onSave?.(profileData);
    };

    const updateProfile = (field: keyof ProfileData, value: any) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
        setProfileData(prev => {
            const updated = [...prev.experience];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, experience: updated };
        });
    };

    const addExperience = () => {
        setProfileData(prev => ({
            ...prev,
            experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
        }));
    };

    const removeExperience = (index: number) => {
        setProfileData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const addSkill = (skill: string) => {
        if (skill.trim() && !profileData.skills.includes(skill.trim())) {
            setProfileData(prev => ({
                ...prev,
                skills: [...prev.skills, skill.trim()]
            }));
        }
    };

    const removeSkill = (skill: string) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const addEducation = () => {
        setProfileData(prev => ({
            ...prev,
            education: [...prev.education, { school: '', degree: '', field: '', year: '' }]
        }));
    };

    const removeEducation = (index: number) => {
        setProfileData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
        setProfileData(prev => {
            const updated = [...prev.education];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, education: updated };
        });
    };

    const addAchievement = () => {
        setProfileData(prev => ({
            ...prev,
            achievements: [...prev.achievements, { name: '', issuer: '', date: '' }]
        }));
    };

    const removeAchievement = (index: number) => {
        setProfileData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const updateAchievement = (index: number, field: keyof AchievementEntry, value: string) => {
        setProfileData(prev => {
            const updated = [...prev.achievements];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, achievements: updated };
        });
    };

    const addRecommendation = () => {
        setProfileData(prev => ({
            ...prev,
            recommendations: [...prev.recommendations, '']
        }));
    };

    const removeRecommendation = (index: number) => {
        setProfileData(prev => ({
            ...prev,
            recommendations: prev.recommendations.filter((_, i) => i !== index)
        }));
    };

    const updateRecommendation = (index: number, value: string) => {
        setProfileData(prev => {
            const updated = [...prev.recommendations];
            updated[index] = value;
            return { ...prev, recommendations: updated };
        });
    };

    return (
        <div className="w-full h-full flex">
            {/* Left Panel - Edit Form */}
            <div className="w-1/2 h-full border-r border-gray-200 overflow-y-auto">
                <EditView
                    profileData={profileData}
                    updateProfile={updateProfile}
                    updateExperience={updateExperience}
                    addExperience={addExperience}
                    removeExperience={removeExperience}
                    addSkill={addSkill}
                    removeSkill={removeSkill}
                    addEducation={addEducation}
                    removeEducation={removeEducation}
                    updateEducation={updateEducation}
                    addAchievement={addAchievement}
                    removeAchievement={removeAchievement}
                    updateAchievement={updateAchievement}
                    addRecommendation={addRecommendation}
                    removeRecommendation={removeRecommendation}
                    updateRecommendation={updateRecommendation}
                />
            </div>

            {/* Right Panel - Live Preview */}
            <div className="w-1/2 h-full overflow-y-auto bg-gray-50">
                <LinkedInProfileView profileData={profileData} />
            </div>
        </div>
    );
});

export default LinkedInProfilePreview;

function EditView({
    profileData,
    updateProfile,
    updateExperience,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addEducation,
    removeEducation,
    updateEducation,
    addAchievement,
    removeAchievement,
    updateAchievement,
    addRecommendation,
    removeRecommendation,
    updateRecommendation,
}: {
    profileData: ProfileData;
    updateProfile: (field: keyof ProfileData, value: any) => void;
    updateExperience: (index: number, field: keyof ExperienceEntry, value: string) => void;
    addExperience: () => void;
    removeExperience: (index: number) => void;
    addSkill: (skill: string) => void;
    removeSkill: (skill: string) => void;
    addEducation: () => void;
    removeEducation: (index: number) => void;
    updateEducation: (index: number, field: keyof EducationEntry, value: string) => void;
    addAchievement: () => void;
    removeAchievement: (index: number) => void;
    updateAchievement: (index: number, field: keyof AchievementEntry, value: string) => void;
    addRecommendation: () => void;
    removeRecommendation: (index: number) => void;
    updateRecommendation: (index: number, value: string) => void;
}) {
    const [newSkill, setNewSkill] = useState('');

    return (
        <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => updateProfile('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                        <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => updateProfile('location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="San Francisco Bay Area"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Headline *</label>
                    <input
                        type="text"
                        value={profileData.headline}
                        onChange={(e) => updateProfile('headline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Senior Software Engineer at TechCorp | Building scalable systems"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
                    <textarea
                        value={profileData.about}
                        onChange={(e) => updateProfile('about', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Write a compelling summary of your experience, skills, and goals..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{profileData.about.length}/2600 characters</p>
                </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                    <button
                        onClick={addExperience}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Add Position
                    </button>
                </div>

                {profileData.experience.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                        <button
                            onClick={() => removeExperience(index)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                        >
                            ×
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Job Title"
                            />
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Company Name"
                            />
                        </div>

                        <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Jan 2020 - Present · 4 yrs"
                        />

                        <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </div>
                ))}

                {profileData.experience.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No experience added yet</p>
                        <button
                            onClick={addExperience}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            + Add your first position
                        </button>
                    </div>
                )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                addSkill(newSkill);
                                setNewSkill('');
                            }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a skill and press Enter"
                    />
                    <button
                        onClick={() => {
                            addSkill(newSkill);
                            setNewSkill('');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-blue-900 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>

                {profileData.skills.length === 0 && (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                )}
            </div>

            {/* Education */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                    <button
                        onClick={addEducation}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Add Education
                    </button>
                </div>

                {profileData.education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                        <button
                            onClick={() => removeEducation(index)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                        >
                            ×
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="School Name"
                            />
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Degree (e.g., Bachelor's)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Field of Study"
                            />
                            <input
                                type="text"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Graduation Year"
                            />
                        </div>
                    </div>
                ))}

                {profileData.education.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No education added yet</p>
                    </div>
                )}
            </div>

            {/* Achievements & Licenses */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Achievements & Licenses</h3>
                    <button
                        onClick={addAchievement}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Add Achievement
                    </button>
                </div>

                {profileData.achievements.map((achievement, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                        <button
                            onClick={() => removeAchievement(index)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                        >
                            ×
                        </button>

                        <input
                            type="text"
                            value={achievement.name}
                            onChange={(e) => updateAchievement(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Achievement or License Name"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={achievement.issuer}
                                onChange={(e) => updateAchievement(index, 'issuer', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Issuing Organization"
                            />
                            <input
                                type="text"
                                value={achievement.date}
                                onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Date (e.g., Jan 2024)"
                            />
                        </div>
                    </div>
                ))}

                {profileData.achievements.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No achievements added yet</p>
                        <button
                            onClick={addAchievement}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            + Add your first achievement
                        </button>
                    </div>
                )}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                    <button
                        onClick={addRecommendation}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Add Recommendation
                    </button>
                </div>

                {profileData.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                        <button
                            onClick={() => removeRecommendation(index)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                        >
                            ×
                        </button>

                        <textarea
                            value={rec}
                            onChange={(e) => updateRecommendation(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Suggested recommendation text or guidance on what to ask for..."
                        />
                    </div>
                ))}

                {profileData.recommendations.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No recommendations added yet</p>
                        <button
                            onClick={addRecommendation}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            + Add a recommendation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
