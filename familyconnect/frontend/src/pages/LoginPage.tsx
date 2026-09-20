import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "OFFICER" ? "/officer/dashboard" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      const nextUser = JSON.parse(localStorage.getItem("familyconnect_user") || "null");
      navigate(nextUser?.role === "OFFICER" ? "/officer/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-extrabold shadow-inner">
            GUJ
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Government of Gujarat
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            FamilyConnect Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Citizen & Officer Unified Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. citizen1@gujarat.gov.in"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("citizen1@gujarat.gov.in", "Citizen@123")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
            >
              👤 Citizen 1 (Rajesh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("officer@gujarat.gov.in", "Officer@123")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition"
            >
              🏛️ Officer (Pooja)
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          New citizen without an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
