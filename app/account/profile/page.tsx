"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  // Sync state when user loads
  if (user && name === "" && user.name) setName(user.name);
  if (user && phone === "" && user.phone) setPhone(user.phone);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
      toast.success("Profile updated.");
    } catch {
      toast.error("Could not save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-6 max-w-lg">
      <h2 className="font-heading font-bold text-ink text-lg mb-6">Edit profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email — read-only */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={user?.email ?? ""}
            readOnly
            aria-readonly="true"
            className="w-full h-11 px-3 rounded-md border border-line bg-canvas text-ink-muted text-sm cursor-not-allowed"
          />
          <p className="text-xs text-ink-muted mt-1.5">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1.5">
            Phone number <span className="text-ink-muted font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+233 24 000 0000"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2"
          />
          <p className="text-xs text-ink-muted mt-1.5">Used for delivery coordination only.</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover disabled:opacity-60 transition-colors min-h-[44px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-line">
        <h3 className="font-semibold text-ink text-sm mb-2">Change password</h3>
        <p className="text-sm text-ink-muted">
          To change your password, sign out and use the{" "}
          <span className="text-ink-muted line-through">forgot password</span> flow.{" "}
          <span className="text-ink-muted text-xs">
            (Password reset coming in a future update.)
          </span>
        </p>
      </div>
    </div>
  );
}
