"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ExportCsvButton } from "@/components/admin/inventory/ExportCsvButton";
import { ProductsTab } from "@/components/admin/inventory/ProductsTab";
import { RecentMovementsTab } from "@/components/admin/inventory/RecentMovementsTab";
import type { TabValue } from "@/components/admin/inventory/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<TabValue>("products");

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Inventory"
        description="Track stock on hand, units reserved by pending orders, and every stock movement."
        actions={<ExportCsvButton />}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList aria-label="Inventory views">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="movements">Recent movements</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="movements">
          <RecentMovementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
