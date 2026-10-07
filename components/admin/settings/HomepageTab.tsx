"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { TabsContent } from "@/components/ui/tabs";
import { Image as ImageIcon, Plus, Trash2, Truck } from "lucide-react";
import { Field, ImageField, SwitchField } from "./fields";
import type { AnnouncementForm, HeroForm, HomepageForm, ImageValue, PromoTileForm } from "./model";
import {
  ICON_BTN,
  INPUT_CLASS,
  MAX_PROMO_TILES,
  SECONDARY_BTN,
  SECTION_CLASS,
  TEXTAREA_CLASS,
} from "./model";

interface HomepageTabProps {
  form: HomepageForm;
  shopName: string;
  patchHero: (patch: Partial<HeroForm>) => void;
  patchAnnouncement: (patch: Partial<AnnouncementForm>) => void;
  patchPromoTile: (index: number, patch: Partial<PromoTileForm>) => void;
  onAddPromoTile: () => void;
  onRemovePromoTile: (index: number) => void;
  uploading: boolean;
  onUpload: (file: File) => Promise<ImageValue | null>;
  saveBar: ReactNode;
}

export function HomepageTab({
  form,
  shopName,
  patchHero,
  patchAnnouncement,
  patchPromoTile,
  onAddPromoTile,
  onRemovePromoTile,
  uploading,
  onUpload,
  saveBar,
}: HomepageTabProps) {
  const hero = form.hero;
  const announcement = form.announcement;

  return (
    <TabsContent value="homepage" className="mt-4 space-y-4">
      <section className={SECTION_CLASS} aria-labelledby="home-announcement-heading">
        <div className="border-b border-line pb-3">
          <h2
            id="home-announcement-heading"
            className="font-heading font-semibold text-sm text-ink"
          >
            Announcement bar
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Appears above every page while it is switched on.
          </p>
        </div>

        <SwitchField
          id="announcement-enabled"
          label="Show announcement bar"
          helper="Turn this off to hide the bar across the storefront."
          checked={announcement.enabled}
          onCheckedChange={(checked) => patchAnnouncement({ enabled: checked })}
        />

        <Field id="announcement-text" label="Announcement text" required>
          {(id) => (
            <input
              id={id}
              type="text"
              value={announcement.text}
              onChange={(e) => patchAnnouncement({ text: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field
          id="announcement-link"
          label="Announcement link"
          helper='Optional. Must start with "/" or "https://".'
        >
          {(id) => (
            <input
              id={id}
              type="text"
              value={announcement.link}
              onChange={(e) => patchAnnouncement({ link: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>
      </section>

      <section className={SECTION_CLASS} aria-labelledby="home-hero-heading">
        <div className="border-b border-line pb-3">
          <h2 id="home-hero-heading" className="font-heading font-semibold text-sm text-ink">
            Hero
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            First section visitors see on the homepage.
          </p>
        </div>

        <Field id="hero-title" label="Hero title" required>
          {(id) => (
            <input
              id={id}
              type="text"
              value={hero.title}
              onChange={(e) => patchHero({ title: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field id="hero-subtitle" label="Hero subtitle">
          {(id) => (
            <textarea
              id={id}
              rows={3}
              value={hero.subtitle}
              onChange={(e) => patchHero({ subtitle: e.target.value })}
              className={TEXTAREA_CLASS}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="hero-button-text" label="Button text">
            {(id) => (
              <input
                id={id}
                type="text"
                value={hero.buttonText}
                onChange={(e) => patchHero({ buttonText: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>

          <Field
            id="hero-button-link"
            label="Button link"
            helper='Must start with "/" or "https://".'
          >
            {(id) => (
              <input
                id={id}
                type="text"
                value={hero.buttonLink}
                onChange={(e) => patchHero({ buttonLink: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>
        </div>

        <ImageField
          id="hero-image"
          label="Hero image"
          helperText="JPEG, PNG, or WebP up to 5 MB. Shown beside the hero text on the homepage."
          value={hero.image}
          uploading={uploading}
          onUpload={onUpload}
          onChange={(image) => patchHero({ image })}
        />
      </section>

      {/* Live preview of the homepage hero, rendered from form state */}
      <section className="bg-surface border border-line rounded-lg overflow-hidden" aria-label="Homepage preview">
        <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading font-semibold text-sm text-ink">Homepage preview</h2>
          <span className="text-[11px] font-mono text-ink-muted">Updates as you type</span>
        </div>

        {announcement.enabled && (
          <div className="bg-canvas-strong border-b border-line px-5 py-3 flex items-center justify-center gap-2 text-xs text-ink">
            <Truck className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
            <span className={announcement.text ? "truncate" : "text-ink-subtle truncate"}>
              {announcement.text || "Announcement text not set"}
            </span>
            {announcement.link.trim() && (
              <span className="underline font-medium shrink-0">View details</span>
            )}
          </div>
        )}

        <div className="bg-canvas p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-muted block">
                {shopName || "Shop name"} · Accra, Ghana
              </span>

              <h3
                className={`font-heading font-bold text-xl sm:text-2xl tracking-tight leading-[1.1] ${
                  hero.title ? "text-ink" : "text-ink-subtle"
                }`}
              >
                {hero.title || "Hero title not set"}
              </h3>

              <p
                className={`text-sm leading-relaxed ${
                  hero.subtitle ? "text-ink-muted" : "text-ink-subtle"
                }`}
              >
                {hero.subtitle || "Hero subtitle not set"}
              </p>

              <span
                className={`inline-flex items-center justify-center h-11 px-5 rounded-md text-xs font-semibold ${
                  hero.buttonText.trim() ? "bg-brand text-white" : "bg-canvas-strong text-ink-muted"
                }`}
              >
                {hero.buttonText.trim() || "Button text not set"}
              </span>
            </div>

            <div className="lg:col-span-5">
              {hero.image.previewUrl ? (
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm border border-line bg-surface">
                  <Image
                    src={hero.image.previewUrl}
                    alt={hero.title || "Homepage hero image"}
                    width={800}
                    height={600}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-sm border border-line bg-canvas flex flex-col items-center justify-center gap-2 text-ink-muted">
                  <ImageIcon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-xs">No hero image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={SECTION_CLASS} aria-labelledby="home-promo-heading">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 id="home-promo-heading" className="font-heading font-semibold text-sm text-ink">
              Promo tiles
            </h2>
            <p className="text-[11px] text-ink-muted mt-1 leading-tight">
              Up to {MAX_PROMO_TILES} tiles shown below the homepage hero.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddPromoTile}
            disabled={form.promoTiles.length >= MAX_PROMO_TILES}
            className={SECONDARY_BTN}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add promo tile</span>
          </button>
        </div>

        {form.promoTiles.length === 0 ? (
          <p className="text-xs text-ink-muted">
            No promo tiles yet. Add one to feature a category on the homepage.
          </p>
        ) : (
          <div className="space-y-4">
            {form.promoTiles.map((tile, index) => (
              <div key={index} className="border border-line rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">Tile {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemovePromoTile(index)}
                    className={ICON_BTN}
                    title="Remove promo tile"
                    aria-label={`Remove promo tile ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id={`promo-${index}-title`} label="Title" required>
                    {(id) => (
                      <input
                        id={id}
                        type="text"
                        value={tile.title}
                        onChange={(e) => patchPromoTile(index, { title: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    )}
                  </Field>

                  <Field
                    id={`promo-${index}-link`}
                    label="Link"
                    helper='Must start with "/" or "https://".'
                  >
                    {(id) => (
                      <input
                        id={id}
                        type="text"
                        value={tile.link}
                        onChange={(e) => patchPromoTile(index, { link: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    )}
                  </Field>
                </div>

                <Field id={`promo-${index}-subtitle`} label="Subtitle">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={tile.subtitle}
                      onChange={(e) => patchPromoTile(index, { subtitle: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  )}
                </Field>

                <ImageField
                  id={`promo-${index}-image`}
                  label="Tile image"
                  helperText="JPEG, PNG, or WebP up to 5 MB."
                  value={tile.image}
                  uploading={uploading}
                  onUpload={onUpload}
                  onChange={(image) => patchPromoTile(index, { image })}
                  previewClassName="h-32"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {saveBar}
    </TabsContent>
  );
}
