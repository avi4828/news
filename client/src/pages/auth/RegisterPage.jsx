import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tl-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tl-accent to-tl-accent2 flex items-center justify-center shadow-glow-sm">
            <ShieldCheck size={24} className="text-tl-bg" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-tl-text">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-tl-muted">
          Or <Link to="/login" className="font-medium text-tl-accent hover:text-cyan-400">sign in to an existing account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="card px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-tl-text mb-2">Username</label>
              <input
                type="text"
                required
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tl-text mb-2">Email address</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tl-text mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
