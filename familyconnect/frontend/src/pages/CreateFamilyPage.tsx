import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBanner } from "../components/ErrorBanner";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useFamily } from "../hooks/useFamily";

const districts = [
  "Ahmedabad",
  "Amreli",
  "Anand",
  "Aravalli",
  "Banaskantha",
  "Bharuch",
  "Bhavnagar",
  "Botad",
  "Chhota Udaipur",
  "Dahod",
  "Dang",
  "Gandhinagar",
  "Gir Somnath",
  "Jamnagar",
  "Junagadh",
  "Kheda",
  "Kutch",
  "Mahisagar",
  "Mehsana",
  "Morbi",
  "Narmada",
  "Navsari",
  "Panchmahal",
  "Patan",
  "Porbandar",
  "Rajkot",
  "Sabarkantha",
  "Surat",
  "Surendranagar",
  "Tapi",
  "Vadodara",
  "Valsad",
];

const emptyForm = {
  annualIncome: "",
  address: "",
  district: "Ahmedabad",
  taluka: "",
  village: "",
};

export const CreateFamilyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { family, create, update } = useFamily();

  // Determine if editing based on route or existing family
  const isEditing = location.pathname.includes("/edit") || Boolean(family);

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    annualIncome: family?.annualIncome ? String(family.annualIncome) : "",
    address: family?.address || "",
    district: family?.district || "Ahmedabad",
    taluka: family?.taluka || "",
    village: family?.village || "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (family) {
      setForm({
        annualIncome: family.annualIncome !== undefined ? String(family.annualIncome) : "",
        address: family.address || "",
        district: family.district || "Ahmedabad",
        taluka: family.taluka || "—",
        village: family.village || "",
      });
    }
  }, [family]);

  const handleFieldChange = (name: string, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (Number(form.annualIncome) < 0) {
        throw new Error("Annual income cannot be negative");
      }
      if (!form.district) {
        throw new Error("Please select a valid district in Gujarat");
      }

      const payload = {
        annualIncome: Number(form.annualIncome) || 0,
        address: form.address.trim(),
        district: form.district,
        taluka: form.taluka.trim(),
        village: form.village.trim(),
      };

      if (isEditing && family?.familyId) {
        await update(payload);
      } else {
        await create(payload);
      }

      navigate("/family");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save family details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-2">
      <Card
        title={isEditing ? "Edit Family Record" : "Register Family Profile"}
        subtitle="Provide household income, location, and residential information for government records."
        className="shadow-md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Annual Household Income (₹)"
            type="number"
            min="0"
            step="1000"
            value={form.annualIncome}
            onChange={(e) => handleFieldChange("annualIncome", e.target.value)}
            placeholder="e.g. 250000"
            required
          />

          <Input
            label="Residential Address"
            value={form.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            placeholder="Street address, house/flat number, landmark"
            required
          />

          <Select
            label="District (Gujarat)"
            value={form.district}
            onChange={(e) => handleFieldChange("district", e.target.value)}
            required
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Taluka / Tehsil"
              value={form.taluka}
              onChange={(e) => handleFieldChange("taluka", e.target.value)}
              placeholder="e.g. Jetpur"
              required
            />
            <Input
              label="Village / City Ward"
              value={form.village}
              onChange={(e) => handleFieldChange("village", e.target.value)}
              placeholder="e.g. Mota"
              required
            />
          </div>

          {error ? <ErrorBanner message={error} /> : null}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(family ? "/family" : "/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Register Family"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
