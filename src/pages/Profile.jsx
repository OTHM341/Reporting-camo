import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Layout/Header';
import { User, Mail, Shield, Calendar, Edit } from 'lucide-react';

function Profile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setIsEditing(false);
            // In a real app, you'd update the user context
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ram-green"></div>
            </div>
        );
    }

    return (
        <div>
            <Header title="User Profile" subtitle="Manage your account information" />

            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-ram-green to-ram-darkGreen px-8 py-12 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                                <p className="text-ram-green/80">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    {user.roles?.map(role => (
                                        <span key={role} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 text-ram-green hover:bg-ram-green/10 rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-green/20 focus:border-ram-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-green/20 focus:border-ram-green"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-green/20 focus:border-ram-green"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-ram-green hover:bg-ram-darkGreen text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Full Name
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{user.firstName} {user.lastName}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Role
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Shield className="w-5 h-5 text-gray-400" />
                                            <div className="flex gap-2">
                                                {user.roles?.map(role => (
                                                    <span key={role} className="px-3 py-1 bg-ram-green/10 text-ram-green rounded-full text-sm font-medium">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Member Since
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">January 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Account Statistics */}
                    <div className="border-t border-gray-200 p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">24</div>
                                <div className="text-sm text-blue-600">Tasks Completed</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">156</div>
                                <div className="text-sm text-green-600">Hours Worked</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">98%</div>
                                <div className="text-sm text-purple-600">On-Time Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
