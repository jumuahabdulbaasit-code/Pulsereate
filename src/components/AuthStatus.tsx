import React, { useState } from 'react';
import { Fingerprint, LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { auth, signOut } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { registerBiometrics, loginWithBiometrics, isBiometricsAvailable } from '../lib/biometrics';

export default function AuthStatus() {
  const [user, loading] = useAuthState(auth);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      // If we have a stored credential, try to login. Otherwise register.
      const storedId = localStorage.getItem('goldencheck_credential_id');
      if (storedId) {
        await loginWithBiometrics();
      } else {
        await registerBiometrics();
      }
    } catch (err) {
      console.error('Biometric auth failed', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      
      // If it failed because of no account, try registering
      if (err instanceof Error && err.message.includes('No account found')) {
        try {
          await registerBiometrics();
        } catch (regErr) {
          setError('Failed to register device');
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    // We don't clear the credential ID so they can log back in easily
  };

  if (loading) return (
    <div className="w-8 h-8 rounded-full bg-calm-100 animate-pulse" />
  );

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-calm-900 leading-none">Secure Session</p>
          <p className="text-[10px] text-calm-400 mt-1 flex items-center justify-end gap-1">
            <ShieldCheck className="w-2 h-2 text-green-500" /> Biometric Verified
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-calm-50 flex items-center justify-center border border-calm-100 hover:bg-calm-100 transition-all group"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-calm-400 group-hover:text-calm-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleBiometricAuth}
        disabled={isAuthenticating || !isBiometricsAvailable()}
        className="flex items-center gap-2 px-4 py-2 bg-calm-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-calm-800 transition-all shadow-lg shadow-calm-900/10 disabled:opacity-50"
      >
        {isAuthenticating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Fingerprint className="w-4 h-4" />
        )}
        {localStorage.getItem('goldencheck_credential_id') ? 'Unlock App' : 'Enable Biometrics'}
      </button>
      {error && (
        <p className="text-[8px] text-red-500 font-bold uppercase tracking-tighter">
          {error}
        </p>
      )}
      {!isBiometricsAvailable() && (
        <p className="text-[8px] text-calm-400 font-bold uppercase tracking-tighter">
          Biometrics not supported on this browser
        </p>
      )}
    </div>
  );
}
