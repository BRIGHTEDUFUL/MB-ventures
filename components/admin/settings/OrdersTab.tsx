"use client";

import type { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Field, SwitchField } from "./fields";
import type { OrdersForm } from "./model";
import { INPUT_CLASS, SECTION_CLASS } from "./model";

interface OrdersTabProps {
  form: OrdersForm;
  patchOrders: (patch: Partial<OrdersForm>) => void;
  currency: string;
  thresholdHelper: string;
  saveBar: ReactNode;
}

export function OrdersTab({ form, patchOrders, currency, thresholdHelper, saveBar }: OrdersTabProps) {
  return (
    <TabsContent value="orders" className="mt-4 space-y-4">
      <section className={SECTION_CLASS} aria-labelledby="orders-delivery-heading">
        <div className="border-b border-line pb-3">
          <h2
            id="orders-delivery-heading"
            className="font-heading font-semibold text-sm text-ink"
          >
            Delivery and payment
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Applies to every new order unless a delivery zone overrides it.
          </p>
        </div>

        <Field
          id="orders-free-threshold"
          label={`Free delivery threshold (${currency})`}
          helper={thresholdHelper}
        >
          {(id) => (
            <input
              id={id}
              type="text"
              inputMode="decimal"
              value={form.freeDeliveryThreshold}
              onChange={(e) => patchOrders({ freeDeliveryThreshold: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <SwitchField
          id="orders-cod"
          label="Accept cash on delivery"
          helper="Customers pay the rider when the order arrives."
          checked={form.cashOnDeliveryEnabled}
          onCheckedChange={(checked) => patchOrders({ cashOnDeliveryEnabled: checked })}
        />

        <SwitchField
          id="orders-pay-in-store"
          label="Accept payment in store"
          helper="Customers pay at the pickup counter instead of ordering online."
          checked={form.payInStoreEnabled}
          onCheckedChange={(checked) => patchOrders({ payInStoreEnabled: checked })}
        />
      </section>

      <section className={SECTION_CLASS} aria-labelledby="orders-rules-heading">
        <div className="border-b border-line pb-3">
          <h2 id="orders-rules-heading" className="font-heading font-semibold text-sm text-ink">
            Order rules
          </h2>
          <p className="text-[11px] text-ink-muted mt-1 leading-tight">
            Controls how long unpaid orders wait and when stock is flagged as low.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            id="orders-expiry"
            label="Order expiry (minutes)"
            helper="Between 10 and 1440 minutes."
          >
            {(id) => (
              <input
                id={id}
                type="number"
                min={10}
                max={1440}
                step={1}
                value={form.orderExpiryMinutes}
                onChange={(e) => patchOrders({ orderExpiryMinutes: e.target.value })}
                className={`${INPUT_CLASS} font-mono`}
              />
            )}
          </Field>

          <Field
            id="orders-low-stock"
            label="Low stock threshold"
            helper="Stock at or below this count is flagged as low."
          >
            {(id) => (
              <input
                id={id}
                type="number"
                min={0}
                step="any"
                value={form.lowStockThreshold}
                onChange={(e) => patchOrders({ lowStockThreshold: e.target.value })}
                className={`${INPUT_CLASS} font-mono`}
              />
            )}
          </Field>

          <Field
            id="orders-max-cart"
            label="Maximum per cart"
            helper="Highest quantity of one product per order."
          >
            {(id) => (
              <input
                id={id}
                type="number"
                min={1}
                step={1}
                value={form.maxCartQuantity}
                onChange={(e) => patchOrders({ maxCartQuantity: e.target.value })}
                className={`${INPUT_CLASS} font-mono`}
              />
            )}
          </Field>
        </div>

        <Field
          id="orders-tax-note"
          label="Price note"
          helper="Shown next to prices across the storefront."
        >
          {(id) => (
            <input
              id={id}
              type="text"
              value={form.pricesIncludeTaxNote}
              onChange={(e) => patchOrders({ pricesIncludeTaxNote: e.target.value })}
              className={INPUT_CLASS}
            />
          )}
        </Field>
      </section>

      {saveBar}
    </TabsContent>
  );
}
