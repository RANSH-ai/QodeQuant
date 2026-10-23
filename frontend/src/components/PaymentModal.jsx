import { API_BASE_URL } from '../apiConfig';
import React, { useState } from 'react';
import { X, QrCode, CheckCircle, ShieldCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentModal({ isOpen, onClose }) {
  const [utr, setUtr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInstantSuccess, setIsInstantSuccess] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/upgrade`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method: 'manual_upi', amount: 5.00, utrNumber: utr })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.isPro) {
          setIsInstantSuccess(true);
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({...currentUser, isPro: true}));
          window.dispatchEvent(new Event('storage'));
        } else {
          setIsSuccess(true);
        }
        setTimeout(() => {
          onClose();
          if (data && data.isPro) {
            window.location.href = '/dashboard';
          } else {
            navigate('/dashboard');
          }
        }, 3000);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f0f0f] border border-[#222] rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden">
        
        {/* Glowing top edge */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600"></div>

        {isInstantSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Payment Verified!</h2>
            <p className="text-gray-400 mb-4">Your UTR was automatically verified via Gmail. You are now a PRO user!</p>
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full text-sm font-bold border border-green-500/20">
              <ShieldCheck size={16} /> Instant Access Granted
            </div>
          </div>
        ) : isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Payment Submitted!</h2>
            <p className="text-gray-400 mb-4">Your payment is under review. You will receive an email once the Admin approves it.</p>
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-full text-sm font-bold border border-yellow-500/20">
              <Clock size={16} /> Pending Approval
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  Upgrade to Pro
                </h2>
                <p className="text-gray-400 text-sm mt-1">Complete your secure payment below.</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            {/* Plan Summary */}
            <div className="bg-[#1a1a2e] border border-blue-900/50 rounded-xl p-4 mb-6 flex justify-between items-center shadow-inner">
              <div>
                <p className="text-white font-bold">Enterprise Plan</p>
                <p className="text-blue-400 text-xs font-mono">Billed Monthly</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 line-through text-xs font-bold">$50.00</p>
                <p className="text-2xl font-black text-white">₹5.00</p>
              </div>
            </div>

            {/* Dynamic UPI QR Code Display */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl mb-6 shadow-inner mx-auto w-48 h-48 border-4 border-blue-500/30 relative overflow-hidden group">
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              </div>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi%3A%2F%2Fpay%3Fpa%3D9431680641%40fam%26pn%3DQodeQuant%26am%3D5.00%26cu%3DINR" 
                alt="UPI QR Code" 
                className="w-32 h-32 object-contain group-hover:scale-105 transition-transform mt-2"
              />
              <p className="text-black font-extrabold text-[10px] mt-3 uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200">Scan to Pay ₹5</p>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-400">Please scan the QR code above using any UPI App (GPay, PhonePe, Paytm) and complete the payment of <strong>₹5.00</strong>.</p>
            </div>

            <form onSubmit={handlePay}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">12-Digit UTR / Reference No.</label>
                  <input 
                    required 
                    type="text" 
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 312456789012" 
                    maxLength="12" 
                    minLength="12"
                    pattern="[0-9]{12}"
                    title="Please enter exactly 12 numeric digits"
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition text-center tracking-[0.3em]" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || utr.length !== 12}
                className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${isProcessing || utr.length !== 12 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'}`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  `Submit UTR for Verification`
                )}
              </button>
            </form>
            
            <p className="text-center text-[10px] text-gray-600 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> SSL Encrypted Checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
