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
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { renderActionButtons, renderSortControls, renderStatusButton } from "./rowControls";
import type { DeleteTarget, LocationFormState, TabValue } from "./types";
import {
  DEFAULT_LOCATION_FORM,
  FOCUS_CLASS,
  INPUT_CLASS,
  TEXTAREA_CLASS,
  reorderRows,
} from "./types";

interface PickupLocationsTabProps {
  createRequest: TabValue | null;
  onCreateRequestHandled: () => void;
}

export function PickupLocationsTab({
  createRequest,
  onCreateRequestHandled,
}: PickupLocationsTabProps) {
  const locations = useQuery(api.fulfillment.adminListPickupLocations, {});

  const createLocation = useMutation(api.fulfillment.createPickupLocation);
  const updateLocation = useMutation(api.fulfillment.updatePickupLocation);
  const removeLocation = useMutation(api.fulfillment.removePickupLocation);
  const toggleLocationActive = useMutation(api.fulfillment.togglePickupLocationActive);

  // Row shapes come from the queries so edits stay type-safe
  type LocationRow = NonNullable<typeof locations>[number];

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationForm, setLocationForm] = useState<LocationFormState>(DEFAULT_LOCATION_FORM);
  const [locationSaving, setLocationSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  const persistLocation = async (row: LocationRow, sortOrder: number): Promise<void> => {
    await updateLocation({
      id: row._id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      openingHours: row.openingHours,
      isActive: row.isActive,
      sortOrder,
    });
  };

  const handleOpenCreateLocation = useCallback(() => {
    setLocationForm({ ...DEFAULT_LOCATION_FORM, sortOrder: (locations?.length ?? 0) + 1 });
    setLocationDialogOpen(true);
  }, [locations]);

  useEffect(() => {
    if (createRequest !== "locations") return;
    handleOpenCreateLocation();
    onCreateRequestHandled();
  }, [createRequest, handleOpenCreateLocation, onCreateRequestHandled]);

  const handleOpenEditLocation = (row: LocationRow) => {
    setLocationForm({
      id: row._id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      openingHours: row.openingHours,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
    setLocationDialogOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = locationForm.name.trim();
    if (!name) {
      toast.error("Please enter a pickup location name.");
      return;
    }
    const address = locationForm.address.trim();
    if (!address) {
      toast.error("Please enter the pickup address.");
      return;
    }
    const phone = locationForm.phone.trim();
    if (!phone) {
      toast.error("Please enter a contact phone number.");
      return;
    }
    const openingHours = locationForm.openingHours.trim();
    if (!openingHours) {
      toast.error("Please enter the opening hours.");
      return;
    }

    const payload = {
      name,
      address,
      phone,
      openingHours,
      isActive: locationForm.isActive,
      sortOrder: locationForm.sortOrder,
    };

    setLocationSaving(true);
    try {
      if (locationForm.id) {
        await updateLocation({ id: locationForm.id, ...payload });
        toast.success(`Pickup location "${name}" updated.`);
      } else {
        await createLocation(payload);
        toast.success(`Pickup location "${name}" created.`);
      }
      setLocationDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save the pickup location.");
    } finally {
      setLocationSaving(false);
    }
  };

  const handleToggleLocation = async (row: LocationRow) => {
    try {
      await toggleLocationActive({ id: row._id, isActive: !row.isActive });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update the pickup location status."
      );
    }
  };

  const handleMoveLocation = async (index: number, direction: -1 | 1) => {
    if (!locations || reordering) return;
    setReordering(true);
    try {
      await reorderRows(locations, index, direction, persistLocation);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder pickup locations.");
    } finally {
      setReordering(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "location") {
        const result = await removeLocation({ id: deleteTarget.id });
        if (!result.deleted && result.deactivated) {
          toast.info(
            "This location is used by existing orders, so it was deactivated instead of deleted."
          );
        } else {
          toast.success(`Pickup location "${deleteTarget.name}" deleted.`);
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
      <TabsContent value="locations">
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          {locations === undefined ? (
            <div className="p-8 text-center text-xs font-mono text-ink-muted">
              Loading pickup locations...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <MapPin
                className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]"
                aria-hidden="true"
              />
              <h3 className="font-heading font-semibold text-sm text-ink">
                No pickup locations yet
              </h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Add a pickup point so customers can collect their orders in store.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateLocation}
                className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover ${FOCUS_CLASS}`}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add pickup location</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-xs">
                <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Opening hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sort</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {locations.map((location: LocationRow, index: number) => (
                    <tr key={location._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-heading font-bold text-sm text-ink">
                          {location.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted">{location.address}</td>
                      <td className="py-3.5 px-4 font-mono text-ink">{location.phone}</td>
                      <td className="py-3.5 px-4 text-ink-muted">{location.openingHours}</td>
                      <td className="py-3.5 px-4">
                        {renderStatusButton(location, () => handleToggleLocation(location))}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderSortControls(
                          reordering,
                          location.name,
                          location.sortOrder,
                          index,
                          locations.length,
                          handleMoveLocation
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {renderActionButtons(
                          location.name,
                          () => handleOpenEditLocation(location),
                          () =>
                            setDeleteTarget({
                              kind: "location",
                              id: location._id,
                              name: location.name,
                            }),
                          "Edit pickup location",
                          "Delete pickup location"
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

      {/* Create / edit pickup location */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-surface border-line p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-line pb-3">
            <DialogTitle className="font-heading font-bold text-lg text-ink">
              {locationForm.id ? "Edit pickup location" : "Add pickup location"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLocation} className="space-y-4 pt-3">
            <div>
              <label htmlFor="location-name" className="block text-xs font-semibold text-ink mb-1">
                Location name <span className="text-danger">*</span>
              </label>
              <input
                id="location-name"
                type="text"
                required
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                placeholder="e.g. Main store"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label
                htmlFor="location-address"
                className="block text-xs font-semibold text-ink mb-1"
              >
                Address <span className="text-danger">*</span>
              </label>
              <textarea
                id="location-address"
                rows={2}
                required
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                placeholder="e.g. 12 Independence Avenue, Accra"
                className={TEXTAREA_CLASS}
              />
            </div>

            <div>
              <label htmlFor="location-phone" className="block text-xs font-semibold text-ink mb-1">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                id="location-phone"
                type="tel"
                required
                value={locationForm.phone}
                onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                placeholder="e.g. 024 123 4567"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="location-hours" className="block text-xs font-semibold text-ink mb-1">
                Opening hours <span className="text-danger">*</span>
              </label>
              <input
                id="location-hours"
                type="text"
                required
                value={locationForm.openingHours}
                onChange={(e) => setLocationForm({ ...locationForm, openingHours: e.target.value })}
                placeholder="e.g. Mon-Sat, 9:00 AM - 6:00 PM"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
              <div>
                <label
                  htmlFor="location-sort-order"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  Sort order
                </label>
                <input
                  id="location-sort-order"
                  type="number"
                  step={1}
                  value={locationForm.sortOrder}
                  onChange={(e) =>
                    setLocationForm({
                      ...locationForm,
                      sortOrder: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className={`${INPUT_CLASS} font-mono`}
                />
                <p className="text-[11px] text-ink-muted mt-1">Lower numbers appear first.</p>
              </div>

              <div className="flex flex-col justify-end">
                <label
                  htmlFor="location-active"
                  className="flex items-center gap-2 cursor-pointer pb-2.5"
                >
                  <input
                    id="location-active"
                    type="checkbox"
                    checked={locationForm.isActive}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  />
                  <span className="text-xs font-semibold text-ink">Active on storefront</span>
                </label>
              </div>
            </div>

            <DialogFooter className="border-t border-line pt-4 flex flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLocationDialogOpen(false)}
                className={`h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas ${FOCUS_CLASS}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={locationSaving}
                className={`h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 ${FOCUS_CLASS}`}
              >
                {locationSaving
                  ? "Saving..."
                  : locationForm.id
                    ? "Update location"
                    : "Create location"}
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
