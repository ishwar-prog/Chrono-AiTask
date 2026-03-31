"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CartoonButton } from "@/components/CartoonButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ishwarrreal@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isRegistering) {
      // Handle registration
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          // Immediately log them in after registration
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] p-8 transition-all">
        <h1 className="text-4xl font-black mb-6 text-center uppercase tracking-tighter text-black dark:text-white">
          CHRONOTASK
        </h1>
        <p className="text-center font-bold mb-8 text-neutral-600 dark:text-neutral-400">
          Sign in to access your AI-powered task manager.
        </p>

        {error && (
          <div className="bg-red-400 border-2 border-black p-3 mb-6 font-bold text-black rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-lg dark:text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-orange-400/50 rounded-lg text-black bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-lg dark:text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-orange-400/50 rounded-lg text-black bg-white"
              required
            />
          </div>

          <div className="pt-4 flex flex-col space-y-4">
            <CartoonButton
              type="submit"
              color={isRegistering ? "bg-green-400" : "bg-orange-400"}
              label={isLoading ? "Please wait..." : (isRegistering ? "REGISTER & LOGIN" : "LOG IN")}
              disabled={isLoading}
              onClick={() => {}}
            />

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              {isRegistering ? "Already have an account? Log In" : "Need an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
