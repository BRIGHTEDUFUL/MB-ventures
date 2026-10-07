"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Loader2, MapPin } from "lucide-react";

type AddressForm = {
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  notes: string;
};

const EMPTY_FORM: AddressForm = {
  label: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  notes: "",
};

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Brong-Ahafo",
  "North East",
  "Savannah",
  "Bono East",
  "Oti",
  "Western North",
  "Ahafo",
];

export default function AddressesPage() {
  const addresses = useQuery(api.addresses.list);
  const createAddress = useMutation(api.addresses.create);
  const updateAddress = useMutation(api.addresses.update);
  const removeAddress = useMutation(api.addresses.remove);
  const setDefault = useMutation(api.addresses.setDefault);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<"addresses"> | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"addresses"> | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<Id<"addresses"> | null>(null);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(addr: NonNullable<typeof addresses>[number]) {
    setEditId(addr._id);
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      region: addr.region,
      notes: addr.notes ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  function field(key: keyof AddressForm) {
    return {
      value: form[key],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        label: form.label.trim(),
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        region: form.region,
        notes: form.notes.trim() || undefined,
      };
      if (editId) {
        await updateAddress({ addressId: editId, ...payload });
        toast.success("Address updated.");
      } else {
        await createAddress(payload);
        toast.success("Address saved.");
      }
      closeForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save address.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: Id<"addresses">) {
    setDeletingId(id);
    try {
      await removeAddress({ addressId: id });
      toast.success("Address removed.");
    } catch {
      toast.error("Could not remove address.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: Id<"addresses">) {
    setSettingDefaultId(id);
    try {
      await setDefault({ addressId: id });
      toast.success("Default address updated.");
    } catch {
      toast.error("Could not update default.");
    } finally {
      setSettingDefaultId(null);
    }
  }

  const inputClass =
    "w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-ink text-lg">Saved addresses</h2>
        {!showForm && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add address
          </button>
        )}
      </div>

      {/* Address form */}
      {showForm && (
        <div className="bg-surface border border-line rounded-lg p-6">
          <h3 className="font-heading font-semibold text-ink mb-5">
            {editId ? "Edit address" : "New address"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Label <span className="text-ink-muted font-normal">(e.g. Home, Office)</span>
                </label>
                <input
                  id="addr-label"
                  type="text"
                  required
                  {...field("label")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Recipient name</label>
                <input
                  id="addr-name"
                  type="text"
                  required
                  autoComplete="name"
                  {...field("recipientName")}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
              <input
                id="addr-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+233 24 000 0000"
                {...field("phone")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Address line 1</label>
              <input
                id="addr-line1"
                type="text"
                required
                autoComplete="address-line1"
                {...field("line1")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Address line 2 <span className="text-ink-muted font-normal">(optional)</span>
              </label>
              <input
                id="addr-line2"
                type="text"
                autoComplete="address-line2"
                {...field("line2")}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">City</label>
                <input
                  id="addr-city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  {...field("city")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Region</label>
                <select
                  id="addr-region"
                  required
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select region</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Delivery notes <span className="text-ink-muted font-normal">(optional)</span>
              </label>
              <textarea
                id="addr-notes"
                rows={2}
                placeholder="Gate color, landmark, access instructions..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-md border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover disabled:opacity-60 transition-colors min-h-[44px]"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editId ? "Save changes" : "Save address"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 border border-line-strong text-ink text-sm font-medium rounded-md hover:bg-canvas transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses === undefined ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-lg h-28 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-surface border border-line rounded-lg p-8 text-center">
          <MapPin className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
          <p className="font-medium text-ink">No saved addresses</p>
          <p className="text-ink-muted text-sm mt-1">
            Save a delivery address to speed up checkout.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr._id}
              className={[
                "bg-surface border rounded-lg p-4",
                addr.isDefault ? "border-brand" : "border-line",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-ink">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-ink text-white px-2 py-0.5 rounded-sm">
                        <Star className="w-2.5 h-2.5" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted mt-1">
                    {addr.recipientName} · {addr.phone}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.region}
                  </p>
                  {addr.notes && (
                    <p className="text-xs text-ink-subtle mt-1 italic">{addr.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      disabled={settingDefaultId === addr._id}
                      title="Set as default"
                      className="p-2 rounded text-ink-muted hover:text-ink hover:bg-canvas transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {settingDefaultId === addr._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    title="Edit address"
                    className="p-2 rounded text-ink-muted hover:text-ink hover:bg-canvas transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    disabled={deletingId === addr._id}
                    title="Remove address"
                    className="p-2 rounded text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {deletingId === addr._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
