import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    gender: "MALE",
    mobile: "",
    occupation: "",
    education: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate(user.role === "OFFICER" ? "/officer/dashboard" : "/dashboard");
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({ ...form, role: "CITIZEN" });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">FamilyConnect</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Citizen registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input required value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date of birth</label>
            <input type="date" required value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
            <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mobile</label>
            <input value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Occupation</label>
            <input value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Education</label>
            <input value={form.education} onChange={(e) => handleChange("education", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">Already have an account?</Link>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
