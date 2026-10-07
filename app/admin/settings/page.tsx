"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomepageTab } from "@/components/admin/settings/HomepageTab";
import { OrdersTab } from "@/components/admin/settings/OrdersTab";
import { ShopInfoTab } from "@/components/admin/settings/ShopInfoTab";
import type {
  AdminSettings,
  AnnouncementForm,
  Forms,
  HeroForm,
  HomepageForm,
  ImageValue,
  OrdersForm,
  PromoTileForm,
  ShopForm,
  SiteSettingsUpdateArgs,
  TabKey,
} from "@/components/admin/settings/model";
import {
  buildForms,
  buildSocialLinks,
  cloneForms,
  DEFAULT_FORMS,
  isAllowedLink,
  MAX_PROMO_TILES,
  parseNumeric,
  parseThreshold,
  PRIMARY_BTN,
  sameForm,
  SECONDARY_BTN,
  TAB_LABELS,
} from "@/components/admin/settings/model";
import { formatMoney } from "@/lib/money";
import { normalizePhone } from "@/lib/phone";
import { optimizeImage, validateImageFile } from "@/lib/image";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function AdminSettingsPage() {
  const settings: AdminSettings | null | undefined = useQuery(api.siteSettings.getAdmin, {});
  const updateSettings: (args: SiteSettingsUpdateArgs) => Promise<{ success: boolean }> =
    useMutation(api.siteSettings.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [hydrated, setHydrated] = useState(false);
  const [forms, setForms] = useState<Forms>(DEFAULT_FORMS);
  const [baseline, setBaseline] = useState<Forms>(DEFAULT_FORMS);

  const [activeTab, setActiveTab] = useState<TabKey>("shop");
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);
  const [savingTab, setSavingTab] = useState<TabKey | null>(null);
  const [uploading, setUploading] = useState(false);

  // Hydrate the forms once, the first time settings resolve (including `null`,
  // which means the singleton has not been created yet).
  useEffect(() => {
    if (hydrated || settings === undefined) return;
    const next = buildForms(settings ?? null);
    setForms(next);
    setBaseline(next);
    setHydrated(true);
  }, [hydrated, settings]);

  const dirty: Record<TabKey, boolean> = {
    shop: !sameForm(forms.shop, baseline.shop),
    homepage: !sameForm(forms.homepage, baseline.homepage),
    orders: !sameForm(forms.orders, baseline.orders),
  };
  const anyDirty = dirty.shop || dirty.homepage || dirty.orders;

  useEffect(() => {
    if (!anyDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [anyDirty]);

  const currency = forms.shop.currency || "GHS";

  const statusFor = (tab: TabKey): string => {
    if (savingTab === tab) return "Saving...";
    return dirty[tab] ? "Unsaved changes" : "All changes saved";
  };

  const handleTabChange = (next: string) => {
    if (next === activeTab) return;
    if (dirty[activeTab]) {
      setPendingTab(next as TabKey);
      return;
    }
    setActiveTab(next as TabKey);
  };

  const finishSave = (tab: TabKey, snapshot: ShopForm | HomepageForm | OrdersForm) => {
    setBaseline((prev) => ({ ...prev, [tab]: snapshot }));
    toast.success(`${TAB_LABELS[tab]} settings saved.`);
  };

  const failSave = (err: unknown) => {
    const msg = err instanceof Error ? err.message : "Settings could not be saved.";
    toast.error(msg);
  };

  /* ------------------------------ image upload ----------------------------- */

  const uploadImage = async (file: File): Promise<ImageValue | null> => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error ?? "This file cannot be uploaded.");
      return null;
    }
    setUploading(true);
    try {
      const optimized = await optimizeImage(file);
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": optimized.type },
        body: optimized,
      });
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}.`);
      }
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      return { imageId: storageId, previewUrl: URL.createObjectURL(optimized) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "The image could not be uploaded.";
      toast.error(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /* --------------------------------- saves -------------------------------- */

  const handleSaveShop = async () => {
    const snapshot = cloneForms(forms.shop);
    if (!snapshot.shopName.trim()) {
      toast.error("Enter a shop name.");
      return;
    }
    if (!snapshot.contactEmail.includes("@")) {
      toast.error("Enter a valid contact email address.");
      return;
    }

    // defaultCountryCode stores an ISO code such as "GH", so normalisation
    // always uses the explicit +233 dialling prefix, matching checkout.
    const contactPhone = normalizePhone(snapshot.contactPhone, "+233");
    if (!contactPhone) {
      toast.error("Enter a valid contact phone number.");
      return;
    }
    const whatsappNumber = normalizePhone(snapshot.whatsappNumber, "+233");
    if (!whatsappNumber) {
      toast.error("Enter a valid WhatsApp number.");
      return;
    }

    const socialFields: Array<[string, string]> = [
      ["Facebook", snapshot.socialLinks.facebook],
      ["Instagram", snapshot.socialLinks.instagram],
      ["X", snapshot.socialLinks.x],
      ["TikTok", snapshot.socialLinks.tiktok],
      ["YouTube", snapshot.socialLinks.youtube],
      ["WhatsApp", snapshot.socialLinks.whatsapp],
    ];
    for (const [name, raw] of socialFields) {
      if (raw.trim() && !raw.trim().startsWith("https://")) {
        toast.error(`${name} link must start with "https://".`);
        return;
      }
    }

    const momoAccounts = snapshot.momoAccounts.map((account) => ({
      network: account.network,
      number: account.number.trim(),
      name: account.name.trim(),
    }));
    if (momoAccounts.some((account) => !account.number || !account.name)) {
      toast.error("Each MoMo account needs a number and an account name.");
      return;
    }

    setSavingTab("shop");
    try {
      await updateSettings({
        shopName: snapshot.shopName.trim(),
        tagline: snapshot.tagline.trim(),
        currency: snapshot.currency,
        defaultCountryCode: snapshot.defaultCountryCode.trim() || "GH",
        contactEmail: snapshot.contactEmail.trim(),
        contactPhone,
        whatsappNumber,
        address: snapshot.address.trim(),
        socialLinks: buildSocialLinks(snapshot.socialLinks),
        momoAccounts,
      });
      finishSave("shop", snapshot);
    } catch (err: unknown) {
      failSave(err);
    } finally {
      setSavingTab(null);
    }
  };

  const handleSaveHomepage = async () => {
    const snapshot = cloneForms(forms.homepage);
    const { announcement, hero, promoTiles } = snapshot;

    if (!isAllowedLink(announcement.link)) {
      toast.error('Announcement link must start with "/" or "https://".');
      return;
    }
    if (!isAllowedLink(hero.buttonLink)) {
      toast.error('Hero button link must start with "/" or "https://".');
      return;
    }
    if (!hero.title.trim()) {
      toast.error("Enter a hero title.");
      return;
    }
    for (const tile of promoTiles) {
      if (!tile.title.trim()) {
        toast.error("Every promo tile needs a title.");
        return;
      }
      if (!isAllowedLink(tile.link)) {
        toast.error('Promo tile links must start with "/" or "https://".');
        return;
      }
    }

    setSavingTab("homepage");
    try {
      await updateSettings({
        announcement: {
          enabled: announcement.enabled,
          text: announcement.text.trim(),
          link: announcement.link.trim(),
        },
        hero: {
          title: hero.title.trim(),
          subtitle: hero.subtitle.trim(),
          buttonText: hero.buttonText.trim(),
          buttonLink: hero.buttonLink.trim(),
          // The image object is replaced wholesale, so the existing storage id
          // travels back with it unless the admin removed the image.
          ...(hero.image.imageId ? { imageId: hero.image.imageId } : {}),
        },
        promoTiles: promoTiles.map((tile) => ({
          title: tile.title.trim(),
          subtitle: tile.subtitle.trim(),
          link: tile.link.trim(),
          ...(tile.image.imageId ? { imageId: tile.image.imageId } : {}),
        })),
      });
      finishSave("homepage", snapshot);
    } catch (err: unknown) {
      failSave(err);
    } finally {
      setSavingTab(null);
    }
  };

  const handleSaveOrders = async () => {
    const snapshot = cloneForms(forms.orders);

    const threshold = parseThreshold(snapshot.freeDeliveryThreshold);
    if (!threshold.valid) {
      toast.error("Enter a free delivery threshold greater than zero, or clear the field.");
      return;
    }
    const expiry = parseNumeric(snapshot.orderExpiryMinutes);
    if (expiry === null || !Number.isInteger(expiry) || expiry < 10 || expiry > 1440) {
      toast.error("Order expiry must be a whole number of minutes between 10 and 1440.");
      return;
    }
    const lowStock = parseNumeric(snapshot.lowStockThreshold);
    if (lowStock === null || lowStock < 0) {
      toast.error("Low stock threshold cannot be below zero.");
      return;
    }
    const maxCart = parseNumeric(snapshot.maxCartQuantity);
    if (maxCart === null || !Number.isInteger(maxCart) || maxCart < 1) {
      toast.error("Maximum cart quantity must be a whole number of at least 1.");
      return;
    }

    setSavingTab("orders");
    try {
      await updateSettings({
        freeDeliveryThreshold: threshold.empty ? null : threshold.minor,
        orderExpiryMinutes: expiry,
        lowStockThreshold: lowStock,
        maxCartQuantity: maxCart,
        pricesIncludeTaxNote: snapshot.pricesIncludeTaxNote,
        cashOnDeliveryEnabled: snapshot.cashOnDeliveryEnabled,
        payInStoreEnabled: snapshot.payInStoreEnabled,
      });
      finishSave("orders", snapshot);
    } catch (err: unknown) {
      failSave(err);
    } finally {
      setSavingTab(null);
    }
  };

  const handleDiscard = (tab: TabKey) => {
    setForms((prev) => ({ ...prev, [tab]: cloneForms(baseline[tab]) }));
    toast.info(`Unsaved changes on ${TAB_LABELS[tab]} were discarded.`);
  };

  /* -------------------------------- mutators ------------------------------ */

  const patchShop = (patch: Partial<ShopForm>) =>
    setForms((prev) => ({ ...prev, shop: { ...prev.shop, ...patch } }));

  const patchHero = (patch: Partial<HeroForm>) =>
    setForms((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, hero: { ...prev.homepage.hero, ...patch } },
    }));

  const patchAnnouncement = (patch: Partial<AnnouncementForm>) =>
    setForms((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, announcement: { ...prev.homepage.announcement, ...patch } },
    }));

  const patchOrders = (patch: Partial<OrdersForm>) =>
    setForms((prev) => ({ ...prev, orders: { ...prev.orders, ...patch } }));

  const patchPromoTile = (index: number, patch: Partial<PromoTileForm>) =>
    setForms((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        promoTiles: prev.homepage.promoTiles.map((tile, i) =>
          i === index ? { ...tile, ...patch } : tile
        ),
      },
    }));

  const handleAddPromoTile = () =>
    setForms((prev) => {
      if (prev.homepage.promoTiles.length >= MAX_PROMO_TILES) return prev;
      return {
        ...prev,
        homepage: {
          ...prev.homepage,
          promoTiles: [
            ...prev.homepage.promoTiles,
            { title: "", subtitle: "", link: "", image: { imageId: null, previewUrl: null } },
          ],
        },
      };
    });

  const handleRemovePromoTile = (index: number) =>
    setForms((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        promoTiles: prev.homepage.promoTiles.filter((_, i) => i !== index),
      },
    }));

  const handleAddMomoAccount = () =>
    setForms((prev) => ({
      ...prev,
      shop: {
        ...prev.shop,
        momoAccounts: [...prev.shop.momoAccounts, { network: "MTN", number: "", name: "" }],
      },
    }));

  const handleRemoveMomoAccount = (index: number) =>
    setForms((prev) => ({
      ...prev,
      shop: {
        ...prev.shop,
        momoAccounts: prev.shop.momoAccounts.filter((_, i) => i !== index),
      },
    }));

  /* --------------------------------- render -------------------------------- */

  const renderSaveBar = (tab: TabKey, onSave: () => Promise<void>, saveLabel: string) => (
    <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-end">
      <p
        role="status"
        aria-live="polite"
        className="text-[11px] font-mono text-ink-muted sm:mr-auto"
      >
        {statusFor(tab)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleDiscard(tab)}
          disabled={!dirty[tab] || savingTab !== null}
          className={SECONDARY_BTN}
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!dirty[tab] || savingTab !== null}
          className={PRIMARY_BTN}
        >
          {savingTab === tab ? "Saving..." : saveLabel}
        </button>
      </div>
    </div>
  );

  const thresholdPreview = parseThreshold(forms.orders.freeDeliveryThreshold);
  const thresholdHelper = thresholdPreview.empty
    ? "Free delivery is switched off."
    : thresholdPreview.valid
      ? `Free delivery applies from ${formatMoney(thresholdPreview.minor, currency)}.`
      : "Enter an amount greater than zero, or clear the field.";

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Site settings"
        description="Edit the shop details, homepage content, and order rules shown across the storefront."
      />

      {!hydrated ? (
        <div className="bg-surface border border-line rounded-lg p-8 text-center text-xs font-mono text-ink-muted">
          Loading site settings...
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto">
            <TabsList className="w-max">
              {(["shop", "homepage", "orders"] as TabKey[]).map((tab) => (
                <TabsTrigger key={tab} value={tab} className="gap-1.5">
                  <span>{TAB_LABELS[tab]}</span>
                  {dirty[tab] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden="true" />
                      <span className="sr-only">(unsaved changes)</span>
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ----------------------------- Shop info ---------------------------- */}
          <ShopInfoTab
            form={forms.shop}
            patchShop={patchShop}
            onAddMomoAccount={handleAddMomoAccount}
            onRemoveMomoAccount={handleRemoveMomoAccount}
            saveBar={renderSaveBar("shop", handleSaveShop, "Save shop info")}
          />

          {/* ----------------------------- Homepage ----------------------------- */}
          <HomepageTab
            form={forms.homepage}
            shopName={forms.shop.shopName}
            patchHero={patchHero}
            patchAnnouncement={patchAnnouncement}
            patchPromoTile={patchPromoTile}
            onAddPromoTile={handleAddPromoTile}
            onRemovePromoTile={handleRemovePromoTile}
            uploading={uploading}
            onUpload={uploadImage}
            saveBar={renderSaveBar("homepage", handleSaveHomepage, "Save homepage")}
          />

          {/* -------------------------- Orders and stock ------------------------- */}
          <OrdersTab
            form={forms.orders}
            patchOrders={patchOrders}
            currency={currency}
            thresholdHelper={thresholdHelper}
            saveBar={renderSaveBar("orders", handleSaveOrders, "Save orders and stock")}
          />
        </Tabs>
      )}

      <ConfirmDialog
        open={pendingTab !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTab(null);
        }}
        title="Unsaved changes"
        description={`You have unsaved changes on the ${TAB_LABELS[activeTab]} tab. Switch tabs anyway? Your edits stay in the form until you save them or leave the page.`}
        confirmLabel="Switch tab"
        onConfirm={() => {
          if (pendingTab) setActiveTab(pendingTab);
          setPendingTab(null);
        }}
      />
    </div>
  );
}
