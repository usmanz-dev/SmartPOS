import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfileAPI, changePasswordAPI } from '../../api/auth.api';
import { setUser } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pSaving, setPSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setPSaving(true);
    try {
      const { data } = await updateProfileAPI(profile);
      dispatch(setUser(data.data));
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) return toast.error('Passwords do not match');
    if (pwd.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await changePasswordAPI({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password changed!');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your account and system preferences</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Profile */}
        <div className="card-glow">
          <h3 className="font-display font-bold text-white tracking-wide mb-4 text-lg">Profile Information</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-bg-primary rounded-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-display font-black text-xl sm:text-2xl border border-accent-green/25 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(59,130,246,0.15))' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-white text-base sm:text-lg">{user?.name}</p>
              <p className="text-slate-400 text-xs sm:text-sm font-body">{user?.email}</p>
              <span className="badge badge-purple mt-1 text-[9px]">{user?.role?.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-3 sm:space-y-4">
            <div>
              <label className="label text-[10px] sm:text-xs">Full Name</label>
              <input className="input text-sm" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name"/>
            </div>
            <div>
              <label className="label text-[10px] sm:text-xs">Phone</label>
              <input className="input text-sm" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000"/>
            </div>
            <div>
              <label className="label text-[10px] sm:text-xs">Email</label>
              <input className="input opacity-50 cursor-not-allowed text-sm" value={user?.email} disabled />
              <p className="text-slate-600 text-[9px] sm:text-[10px] font-body mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={pSaving} className="btn-primary w-full h-9 sm:h-10 text-sm">
              {pSaving ? 'Saving...' : '✓ Update Profile'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card-glow">
          <h3 className="font-display font-bold text-white tracking-wide mb-4 text-lg">Change Password</h3>
          <form onSubmit={changePassword} className="space-y-3 sm:space-y-4">
            <div>
              <label className="label text-[10px] sm:text-xs">Current Password</label>
              <input className="input text-sm" type="password" value={pwd.currentPassword} onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••"/>
            </div>
            <div>
              <label className="label text-[10px] sm:text-xs">New Password</label>
              <input className="input text-sm" type="password" value={pwd.newPassword} onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 6 characters"/>
            </div>
            <div>
              <label className="label text-[10px] sm:text-xs">Confirm Password</label>
              <input className={`input text-sm ${pwd.confirm && pwd.confirm !== pwd.newPassword ? 'input-error' : ''}`} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter password"/>
              {pwd.confirm && pwd.confirm !== pwd.newPassword && <p className="text-accent-red text-[9px] sm:text-[11px] mt-1">Passwords do not match</p>}
            </div>
            <button type="submit" disabled={pwSaving || !pwd.currentPassword || !pwd.newPassword} className="btn-primary w-full h-9 sm:h-10 text-sm disabled:opacity-40">
              {pwSaving ? 'Updating...' : '🔒 Change Password'}
            </button>
          </form>
        </div>

        {/* System info */}
        <div className="card-glow lg:col-span-2">
          <h3 className="font-display font-bold text-white tracking-wide mb-4 text-lg">System Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              ['Version', 'v1.0.0'],
              ['Environment', 'Production'],
              ['Database', 'MongoDB'],
              ['Framework', 'MERN Stack'],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg-primary rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="label text-[9px] sm:text-[10px]">{k}</p>
                <p className="font-display font-bold text-accent-green text-xs sm:text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
