"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DeliveryZonesTab } from "@/components/admin/delivery/DeliveryZonesTab";
import { PickupLocationsTab } from "@/components/admin/delivery/PickupLocationsTab";
import type { TabValue } from "@/components/admin/delivery/types";
import { FOCUS_CLASS } from "@/components/admin/delivery/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function AdminDeliveryPage() {
  const [tab, setTab] = useState<TabValue>("zones");
  const [createRequest, setCreateRequest] = useState<TabValue | null>(null);

  const createOnHeader = () => {
    setCreateRequest(tab);
  };

  const clearCreateRequest = () => {
    setCreateRequest(null);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Delivery & Pickup"
        description="Manage the areas you deliver to and the pickup points customers can collect orders from."
        actions={
          <button
            type="button"
            onClick={createOnHeader}
            className={`inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors ${FOCUS_CLASS}`}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tab === "zones" ? "Add delivery zone" : "Add pickup location"}</span>
          </button>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList aria-label="Delivery and pickup settings">
          <TabsTrigger value="zones">Delivery zones</TabsTrigger>
          <TabsTrigger value="locations">Pickup locations</TabsTrigger>
        </TabsList>

        {/* Delivery zones */}
        <DeliveryZonesTab
          createRequest={createRequest}
          onCreateRequestHandled={clearCreateRequest}
        />

        {/* Pickup locations */}
        <PickupLocationsTab
          createRequest={createRequest}
          onCreateRequestHandled={clearCreateRequest}
        />
      </Tabs>
    </div>
  );
}
