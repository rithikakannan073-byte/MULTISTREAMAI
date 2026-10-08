import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Phone, ArrowRight, ShieldCheck, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { sendOtp, verifyOtp, error, clearError } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [timerActive, setTimerActive] = useState(false);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phoneNumber || phoneNumber.length < 10) return;

    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const res = await sendOtp(fullPhone);
      setStep('otp');
      setCountdown(res.cooldown_seconds || 45);
      setTimerActive(true);
      if (res.demo_hint) {
        setDemoHint(res.demo_hint);
      }
    } catch (err) {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (otp.length < 4) return;

    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await verifyOtp(fullPhone, otp);
    } catch (err) {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timerActive) return;
    clearError();
    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const res = await sendOtp(fullPhone);
      setCountdown(res.cooldown_seconds || 45);
      setTimerActive(true);
      if (res.demo_hint) setDemoHint(res.demo_hint);
    } catch (err) {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };


  const formattedCountdown = `00:${countdown < 10 ? '0' : ''}${countdown}`;

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Surveillance Grid Pattern & Neon Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E2D4A_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            ENTERPRISE SURVEILLANCE GATEWAY
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span>MULTISTREAM <span className="text-cyan-400">AI</span></span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-normal">
            Intelligent Multi-Camera Security & Investigation
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0D1424]/90 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-mono font-semibold text-cyan-400">
                {step === 'phone' ? 'SECURE ACCESS' : 'VERIFY YOUR IDENTITY'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'phone' ? 'Sign in using authorized phone number' : `OTP sent to +91 ${phoneNumber}`}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400">
              {step === 'phone' ? <Phone className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-900/90 focus-within:border-cyan-500 transition-colors">
                  <span className="px-3 py-2.5 bg-slate-800/80 text-slate-400 text-sm font-mono flex items-center border-r border-slate-700 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 bg-transparent px-3 py-2.5 text-white placeholder-slate-600 text-sm font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    6-Digit Security OTP
                  </label>
                  {demoHint && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Use code: {demoHint}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-2.5 text-center text-white tracking-[0.6em] text-lg font-mono focus:outline-none focus:border-cyan-500"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY OTP</span>
                  </>
                )}
              </button>

              {/* Resend & Back controls */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Change Number
                </button>

                {timerActive ? (
                  <span className="text-slate-400 font-mono">
                    Resend OTP in <span className="text-cyan-400 font-medium">{formattedCountdown}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-cyan-400 hover:underline cursor-pointer font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Security Message */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>Your connection is protected by secure authentication.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
