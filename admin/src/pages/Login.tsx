import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/admin/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Login failed');
            } else {
                setError('Login failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-midnight">Couture Admin</h1>
                    <p className="text-stone-500 mt-2">Sign in to manage your store</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-ruvera-gold focus:border-ruvera-gold outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-ruvera-gold focus:border-ruvera-gold outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-midnight text-white py-2.5 rounded-lg hover:bg-stone-800 transition-colors font-medium shadow-lg shadow-stone-200"
                    >
                        Sign In
                    </button>

                    {/* Dev Helper */}
                    <div className="text-center text-xs text-stone-400 mt-4">
                        (Use correct credentials or create admin in backend)
                    </div>
                </form>
            </div>
        </div>
    );
}
