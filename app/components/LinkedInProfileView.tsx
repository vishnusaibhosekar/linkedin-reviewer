'use client';

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

interface LinkedInProfileViewProps {
    profileData: ProfileData;
}

export default function LinkedInProfileView({ profileData }: LinkedInProfileViewProps) {
    return (
        <div className="bg-gray-50 min-h-full">
            {/* LinkedIn Header */}
            <div className="max-w-3xl mx-auto bg-white shadow-sm">
                {/* Banner */}
                <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative"></div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-16 sm:-mt-20">
                    {/* Avatar */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-1 shadow-lg relative z-10">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                            {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                        </div>
                    </div>

                    {/* Name & Headline */}
                    <div className="mt-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {profileData.name || 'Your Name'}
                        </h1>
                        <p className="text-base sm:text-lg text-gray-700 mt-1">
                            {profileData.headline || 'Your Headline'}
                        </p>
                        {profileData.location && (
                            <p className="text-sm text-gray-500 mt-1">
                                {profileData.location} · <span className="text-blue-600 font-medium">Contact info</span>
                            </p>
                        )}
                        <p className="text-sm text-blue-600 font-medium mt-1">
                            {profileData.connections} connections
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors">
                            Open to
                        </button>
                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors">
                            Add profile section
                        </button>
                        <button className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-colors">
                            More
                        </button>
                    </div>
                </div>
            </div>

            {/* About Section */}
            {profileData.about && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {profileData.about}
                    </p>
                </div>
            )}

            {/* Experience Section */}
            {profileData.experience.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
                    <div className="space-y-4">
                        {profileData.experience.map((exp, index) => (
                            <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0"></div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{exp.title || 'Position Title'}</h3>
                                    <p className="text-sm text-gray-700">{exp.company || 'Company Name'}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{exp.duration}</p>
                                    {exp.description && (
                                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {profileData.skills.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                    <div className="space-y-3">
                        {profileData.skills.map((skill) => (
                            <div key={skill} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <h3 className="font-medium text-gray-900">{skill}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Section */}
            {profileData.education.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                    <div className="space-y-4">
                        {profileData.education.map((edu, index) => (
                            <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0"></div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                                    <p className="text-sm text-gray-700">{edu.degree} in {edu.field}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{edu.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements Section */}
            {profileData.achievements.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Licenses</h2>
                    <div className="space-y-3">
                        {profileData.achievements.map((achievement, index) => (
                            <div key={index} className="py-3 border-b border-gray-100 last:border-0">
                                <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                                <p className="text-sm text-gray-600">{achievement.issuer}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{achievement.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations Section */}
            {profileData.recommendations.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white mt-2 px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
                    <div className="space-y-4">
                        {profileData.recommendations.map((rec, index) => (
                            <div key={index} className="py-4 border-b border-gray-100 last:border-0">
                                <p className="text-sm text-gray-700 italic whitespace-pre-wrap">"{rec}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div className="h-8"></div>
        </div>
    );
}
