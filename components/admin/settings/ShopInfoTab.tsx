"use client";

import type { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "./fields";
import type { MomoNetwork, ShopForm, SocialLinksForm } from "./model";
import {
  CURRENCIES,
  ICON_BTN,
  INPUT_CLASS,
  MOMO_NETWORKS,
  SECONDARY_BTN,
  SECTION_CLASS,
  TEXTAREA_CLASS,
} from "./model";

interface ShopInfoTabProps {
  form: ShopForm;
  patchShop: (patch: Partial<ShopForm>) => void;
  onAddMomoAccount: () => void;
  onRemoveMomoAccount: (index: number) => void;
  saveBar: ReactNode;
}

export function ShopInfoTab({
  form,
  patchShop,
  onAddMomoAccount,
  onRemoveMomoAccount,
  saveBar,
}: ShopInfoTabProps) {
  return (
    <TabsContent value="shop" className="mt-4 space-y-4">
      <section className={SECTION_CLASS} aria-labelledby="shop-details-heading">
        <div className="border-b border-line pb-3">
          <h2 id="shop-details-heading" className="font-heading font-semibold text-sm text-ink">
            Shop details
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Shown in the site header, footer, and customer emails.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="shop-name" label="Shop name" required>
            {(id) => (
              <input
                id={id}
                type="text"
                value={form.shopName}
                onChange={(e) => patchShop({ shopName: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>

          <Field id="shop-currency" label="Currency" required>
            {(id) => (
              <select
                id={id}
                value={form.currency}
                onChange={(e) => patchShop({ currency: e.target.value })}
                className={INPUT_CLASS}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field id="shop-tagline" label="Tagline" helper="One line describing the shop.">
          {(id) => (
            <input
              id={id}
              type="text"
              value={form.tagline}
              onChange={(e) => patchShop({ tagline: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field id="shop-address" label="Address">
          {(id) => (
            <textarea
              id={id}
              rows={2}
              value={form.address}
              onChange={(e) => patchShop({ address: e.target.value })}
              className={TEXTAREA_CLASS}
            />
          )}
        </Field>
      </section>

      <section className={SECTION_CLASS} aria-labelledby="shop-contact-heading">
        <div className="border-b border-line pb-3">
          <h2 id="shop-contact-heading" className="font-heading font-semibold text-sm text-ink">
            Contact
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Phone numbers are saved in international format, for example +233241234567.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="shop-email" label="Contact email" required>
            {(id) => (
              <input
                id={id}
                type="email"
                value={form.contactEmail}
                onChange={(e) => patchShop({ contactEmail: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>

          <Field id="shop-country-code" label="Default country code">
            {(id) => (
              <input
                id={id}
                type="text"
                value={form.defaultCountryCode}
                onChange={(e) => patchShop({ defaultCountryCode: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>

          <Field id="shop-phone" label="Contact phone" required>
            {(id) => (
              <input
                id={id}
                type="tel"
                value={form.contactPhone}
                onChange={(e) => patchShop({ contactPhone: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>

          <Field id="shop-whatsapp" label="WhatsApp number" required>
            {(id) => (
              <input
                id={id}
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => patchShop({ whatsappNumber: e.target.value })}
                className={INPUT_CLASS}
              />
            )}
          </Field>
        </div>
      </section>

      <section className={SECTION_CLASS} aria-labelledby="shop-social-heading">
        <div className="border-b border-line pb-3">
          <h2 id="shop-social-heading" className="font-heading font-semibold text-sm text-ink">
            Social links
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Leave a field empty to hide it. Every link must start with https://.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
              ["x", "X"],
              ["tiktok", "TikTok"],
              ["youtube", "YouTube"],
              ["whatsapp", "WhatsApp"],
            ] as Array<[keyof SocialLinksForm, string]>
          ).map(([key, label]) => (
            <Field key={key} id={`social-${key}`} label={label}>
              {(id) => (
                <input
                  id={id}
                  type="url"
                  value={form.socialLinks[key]}
                  onChange={(e) =>
                    patchShop({ socialLinks: { ...form.socialLinks, [key]: e.target.value } })
                  }
                  className={INPUT_CLASS}
                />
              )}
            </Field>
          ))}
        </div>
      </section>

      <section className={SECTION_CLASS} aria-labelledby="shop-momo-heading">
        <div className="border-b border-line pb-3">
          <h2 id="shop-momo-heading" className="font-heading font-semibold text-sm text-ink">
            Mobile Money accounts
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Customers see these numbers when paying with Mobile Money.
          </p>
        </div>

        <div className="space-y-3">
          {form.momoAccounts.length === 0 && (
            <p className="text-xs text-ink-muted">
              No Mobile Money accounts yet. Add one so customers can pay by MoMo.
            </p>
          )}

          {form.momoAccounts.map((account, index) => (
            <div key={index} className="border border-line rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink">Account {index + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveMomoAccount(index)}
                  className={ICON_BTN}
                  title="Remove MoMo account"
                  aria-label={`Remove MoMo account ${index + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field id={`momo-${index}-network`} label="Network">
                  {(id) => (
                    <select
                      id={id}
                      value={account.network}
                      onChange={(e) => {
                        const next = [...form.momoAccounts];
                        next[index] = { ...account, network: e.target.value as MomoNetwork };
                        patchShop({ momoAccounts: next });
                      }}
                      className={INPUT_CLASS}
                    >
                      {MOMO_NETWORKS.map((network) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field id={`momo-${index}-number`} label="Number">
                  {(id) => (
                    <input
                      id={id}
                      type="tel"
                      value={account.number}
                      onChange={(e) => {
                        const next = [...form.momoAccounts];
                        next[index] = { ...account, number: e.target.value };
                        patchShop({ momoAccounts: next });
                      }}
                      className={INPUT_CLASS}
                    />
                  )}
                </Field>

                <Field id={`momo-${index}-name`} label="Account name">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={account.name}
                      onChange={(e) => {
                        const next = [...form.momoAccounts];
                        next[index] = { ...account, name: e.target.value };
                        patchShop({ momoAccounts: next });
                      }}
                      className={INPUT_CLASS}
                    />
                  )}
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={onAddMomoAccount} className={SECONDARY_BTN}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add MoMo account</span>
        </button>
      </section>

      {saveBar}
    </TabsContent>
  );
}
