"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isRegistering) {
      if (!name.trim()) {
        setError("Full Name is required");
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
          await handleSignIn();
        } else {
          const data = await res.json();
          setError(data.message || "Failed to register");
          setIsLoading(false);
        }
      } catch (err) {
        setError("An error occurred during registration");
        setIsLoading(false);
      }
    } else {
      await handleSignIn();
    }
  };

  const handleSignIn = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#111319] flex flex-col items-center justify-center p-4 font-sans">
      
      <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-wider text-[#F97316]">
        CHRONOTASK
      </h1>

      <div className="w-full max-w-sm bg-[#1A1C23] rounded-xl border border-[#D4AF37]/40 shadow-xl p-8 transition-all">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            {isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </h2>
          <p className="text-[#a1a1aa] text-sm mt-2 font-medium">
            {isRegistering ? "Get started with AI-powered task management" : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 mb-6 font-bold text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-white uppercase tracking-wider">FULL NAME</label>
              <input
                type="text"
                placeholder="Jane Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 border border-[#D4AF37]/50 rounded-lg text-[#D4D4D8] bg-[#1A1C23] focus:outline-none focus:border-[#F97316] placeholder:text-[#52525B] transition-colors"
                required={isRegistering}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-xs text-white uppercase tracking-wider">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 border border-[#D4AF37]/50 rounded-lg text-[#D4D4D8] bg-[#1A1C23] focus:outline-none focus:border-[#F97316] placeholder:text-[#52525B] transition-colors font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-xs text-white uppercase tracking-wider">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#D4AF37]/50 rounded-lg text-[#D4D4D8] bg-[#1A1C23] focus:outline-none focus:border-[#F97316] placeholder:text-[#52525B] transition-colors font-medium"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-[#52525B] hover:text-[#A1A1AA]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#F97316] hover:bg-[#EA580C] text-white font-black rounded-lg uppercase tracking-wide transition-colors shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] active:scale-[0.98]"
            >
              {isLoading ? "PLEASE WAIT..." : (isRegistering ? "SIGN UP" : "SIGN IN")}
            </button>
          </div>
          
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
