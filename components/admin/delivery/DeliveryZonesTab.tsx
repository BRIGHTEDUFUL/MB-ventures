"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { formatMoney, fromMinor, toMinor } from "@/lib/money";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { renderActionButtons, renderSortControls, renderStatusButton } from "./rowControls";
import type { DeleteTarget, TabValue, ZoneFormState } from "./types";
import { DEFAULT_ZONE_FORM, FOCUS_CLASS, INPUT_CLASS, reorderRows } from "./types";

interface DeliveryZonesTabProps {
  createRequest: TabValue | null;
  onCreateRequestHandled: () => void;
}

export function DeliveryZonesTab({ createRequest, onCreateRequestHandled }: DeliveryZonesTabProps) {
  const zones = useQuery(api.fulfillment.adminListDeliveryZones, {});

  const createZone = useMutation(api.fulfillment.createDeliveryZone);
  const updateZone = useMutation(api.fulfillment.updateDeliveryZone);
  const removeZone = useMutation(api.fulfillment.removeDeliveryZone);
  const toggleZoneActive = useMutation(api.fulfillment.toggleDeliveryZoneActive);

  // Row shapes come from the queries so edits stay type-safe
  type ZoneRow = NonNullable<typeof zones>[number];

  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(DEFAULT_ZONE_FORM);
  const [zoneSaving, setZoneSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  const persistZone = async (row: ZoneRow, sortOrder: number): Promise<void> => {
    await updateZone({
      id: row._id,
      name: row.name,
      fee: row.fee,
      estimatedDays: row.estimatedDays,
      isActive: row.isActive,
      sortOrder,
    });
  };

  const handleOpenCreateZone = useCallback(() => {
    setZoneForm({ ...DEFAULT_ZONE_FORM, sortOrder: (zones?.length ?? 0) + 1 });
    setZoneDialogOpen(true);
  }, [zones]);

  useEffect(() => {
    if (createRequest !== "zones") return;
    handleOpenCreateZone();
    onCreateRequestHandled();
  }, [createRequest, handleOpenCreateZone, onCreateRequestHandled]);

  const handleOpenEditZone = (row: ZoneRow) => {
    setZoneForm({
      id: row._id,
      name: row.name,
      fee: String(fromMinor(row.fee)),
      estimatedDays: row.estimatedDays,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
    setZoneDialogOpen(true);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = zoneForm.name.trim();
    if (!name) {
      toast.error("Please enter a delivery zone name.");
      return;
    }
    const feeText = zoneForm.fee.trim();
    const feeNumber = Number(feeText);
    if (feeText === "" || !Number.isFinite(feeNumber) || feeNumber < 0) {
      toast.error("Enter a delivery fee of 0 or more.");
      return;
    }
    const estimatedDays = zoneForm.estimatedDays.trim();
    if (!estimatedDays) {
      toast.error("Please enter an estimated delivery time.");
      return;
    }

    const payload = {
      name,
      fee: toMinor(feeNumber),
      estimatedDays,
      isActive: zoneForm.isActive,
      sortOrder: zoneForm.sortOrder,
    };

    setZoneSaving(true);
    try {
      if (zoneForm.id) {
        await updateZone({ id: zoneForm.id, ...payload });
        toast.success(`Delivery zone "${name}" updated.`);
      } else {
        await createZone(payload);
        toast.success(`Delivery zone "${name}" created.`);
      }
      setZoneDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save the delivery zone.");
    } finally {
      setZoneSaving(false);
    }
  };

  const handleToggleZone = async (row: ZoneRow) => {
    try {
      await toggleZoneActive({ id: row._id, isActive: !row.isActive });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update the delivery zone status."
      );
    }
  };

  const handleMoveZone = async (index: number, direction: -1 | 1) => {
    if (!zones || reordering) return;
    setReordering(true);
    try {
      await reorderRows(zones, index, direction, persistZone);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder delivery zones.");
    } finally {
      setReordering(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "zone") {
        const result = await removeZone({ id: deleteTarget.id });
        if (!result.deleted && result.deactivated) {
          toast.info(
            "This zone is used by existing orders, so it was deactivated instead of deleted."
          );
        } else {
          toast.success(`Delivery zone "${deleteTarget.name}" deleted.`);
        }
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete this item.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TabsContent value="zones">
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          {zones === undefined ? (
            <div className="p-8 text-center text-xs font-mono text-ink-muted">
              Loading delivery zones...
            </div>
          ) : zones.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Truck
                className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]"
                aria-hidden="true"
              />
              <h3 className="font-heading font-semibold text-sm text-ink">No delivery zones yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Add a zone to set the delivery fee and estimated time customers see at checkout.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateZone}
                className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover ${FOCUS_CLASS}`}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add delivery zone</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-xs">
                <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Estimated time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sort</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {zones.map((zone: ZoneRow, index: number) => (
                    <tr key={zone._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-heading font-bold text-sm text-ink">{zone.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-ink">
                        {formatMoney(zone.fee)}
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted">{zone.estimatedDays}</td>
                      <td className="py-3.5 px-4">
                        {renderStatusButton(zone, () => handleToggleZone(zone))}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderSortControls(
                          reordering,
                          zone.name,
                          zone.sortOrder,
                          index,
                          zones.length,
                          handleMoveZone
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {renderActionButtons(
                          zone.name,
                          () => handleOpenEditZone(zone),
                          () => setDeleteTarget({ kind: "zone", id: zone._id, name: zone.name }),
                          "Edit delivery zone",
                          "Delete delivery zone"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Create / edit delivery zone */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-surface border-line p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-line pb-3">
            <DialogTitle className="font-heading font-bold text-lg text-ink">
              {zoneForm.id ? "Edit delivery zone" : "Add delivery zone"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveZone} className="space-y-4 pt-3">
            <div>
              <label htmlFor="zone-name" className="block text-xs font-semibold text-ink mb-1">
                Zone name <span className="text-danger">*</span>
              </label>
              <input
                id="zone-name"
                type="text"
                required
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                placeholder="e.g. Greater Accra"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="zone-fee" className="block text-xs font-semibold text-ink mb-1">
                Delivery fee <span className="text-danger">*</span>
              </label>
              <input
                id="zone-fee"
                type="number"
                required
                min={0}
                step="0.01"
                inputMode="decimal"
                value={zoneForm.fee}
                onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })}
                placeholder="0.00"
                className={INPUT_CLASS}
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Amount charged for this zone, in the shop currency.
              </p>
            </div>

            <div>
              <label
                htmlFor="zone-estimated-days"
                className="block text-xs font-semibold text-ink mb-1"
              >
                Estimated time <span className="text-danger">*</span>
              </label>
              <input
                id="zone-estimated-days"
                type="text"
                required
                value={zoneForm.estimatedDays}
                onChange={(e) => setZoneForm({ ...zoneForm, estimatedDays: e.target.value })}
                placeholder="e.g. 1-2 business days"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
              <div>
                <label
                  htmlFor="zone-sort-order"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  Sort order
                </label>
                <input
                  id="zone-sort-order"
                  type="number"
                  step={1}
                  value={zoneForm.sortOrder}
                  onChange={(e) =>
                    setZoneForm({
                      ...zoneForm,
                      sortOrder: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className={`${INPUT_CLASS} font-mono`}
                />
                <p className="text-[11px] text-ink-muted mt-1">Lower numbers appear first.</p>
              </div>

              <div className="flex flex-col justify-end">
                <label
                  htmlFor="zone-active"
                  className="flex items-center gap-2 cursor-pointer pb-2.5"
                >
                  <input
                    id="zone-active"
                    type="checkbox"
                    checked={zoneForm.isActive}
                    onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  />
                  <span className="text-xs font-semibold text-ink">Active on storefront</span>
                </label>
              </div>
            </div>

            <DialogFooter className="border-t border-line pt-4 flex flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setZoneDialogOpen(false)}
                className={`h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas ${FOCUS_CLASS}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={zoneSaving}
                className={`h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 ${FOCUS_CLASS}`}
              >
                {zoneSaving ? "Saving..." : zoneForm.id ? "Update zone" : "Create zone"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={
          deleteTarget
            ? `Delete ${deleteTarget.kind === "zone" ? "delivery zone" : "pickup location"} "${
                deleteTarget.name
              }"?`
            : ""
        }
        description="Are you sure you want to delete this item? This action is permanent. If existing orders use it, it is deactivated instead of deleted."
        confirmLabel={
          deleteTarget && deleteTarget.kind === "zone" ? "Delete zone" : "Delete location"
        }
        variant="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
