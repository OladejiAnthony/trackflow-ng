"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, User, Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Alert } from "@/components/ui/Alert";
import { saveOnboardingProfile } from "../actions";

// ─── Data ────────────────────────────────────────────────────────────────────

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SetupProfilePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [dob, setDob]                     = useState("");
  const [state, setState]                 = useState("");
  const [error, setError]                 = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  // ── Photo upload ─────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/storage/upload-avatar", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");

      setAvatarUrl(json.publicUrl);
    } catch (err) {
      setAvatarPreview(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    if (!dob || !state) {
      setError("Please enter your date of birth and state to continue.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      if (avatarUrl) fd.set("avatar_url", avatarUrl);
      if (dob)       fd.set("date_of_birth", dob);
      if (state)     fd.set("state", state);

      const result = await saveOnboardingProfile(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/onboarding/setup-budget");
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight mb-2">
          Set up your profile
        </h1>
        <p className="text-slate-400 text-sm">
          Help us personalise TrackFlow for you
        </p>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card-xl space-y-6 auth-panel">
        {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500/50 hover:border-brand-400 transition-colors group"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center">
                <User className="w-10 h-10 text-slate-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />
              }
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-slate-500">
            {uploading ? "Uploading…" : "Tap to add a photo (optional)"}
          </p>
        </div>

        {/* Date of birth */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
            <Calendar className="w-4 h-4 opacity-60" />
            Date of birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="input-field"
          />
        </div>

        {/* State */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
            <MapPin className="w-4 h-4 opacity-60" />
            State in Nigeria
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="input-field"
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="brand"
            fullWidth
            size="lg"
            loading={isPending || uploading}
            disabled={!dob || !state}
            onClick={handleSubmit}
          >
            Save &amp; Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={() => router.push("/onboarding/setup-budget")}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
