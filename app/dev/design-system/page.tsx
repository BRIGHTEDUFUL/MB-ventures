import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/shared/Price";
import { ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas p-6 sm:p-12 text-ink">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <header className="border-b border-line pb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">
            MB Ventures GH — Design System
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-ink">
            Design Tokens & Component Preview
          </h1>
          <p className="text-ink-muted mt-2 text-sm sm:text-base">
            Living component catalog adhering strictly to docs/DESIGN.md.
          </p>
        </header>

        {/* 1. Color Tokens */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            1. Color Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-ink rounded-sm mb-2" />
              <div className="font-semibold">ink</div>
              <div className="text-ink-muted font-mono">#14181F</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-ink-muted rounded-sm mb-2" />
              <div className="font-semibold">ink-muted</div>
              <div className="text-ink-muted font-mono">#5B6470</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-canvas rounded-sm border border-line mb-2" />
              <div className="font-semibold">canvas</div>
              <div className="text-ink-muted font-mono">#F4F5F6</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-line-strong rounded-sm mb-2" />
              <div className="font-semibold">line-strong</div>
              <div className="text-ink-muted font-mono">#CDD1D6</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-accent rounded-sm mb-2" />
              <div className="font-semibold">accent</div>
              <div className="text-ink-muted font-mono">#D9480F</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-link rounded-sm mb-2" />
              <div className="font-semibold">link / focus</div>
              <div className="text-ink-muted font-mono">#0A5CC2</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-success rounded-sm mb-2" />
              <div className="font-semibold">success</div>
              <div className="text-ink-muted font-mono">#1B7F4B</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-warning rounded-sm mb-2" />
              <div className="font-semibold">warning</div>
              <div className="text-ink-muted font-mono">#A15C00</div>
            </div>
            <div className="p-3 bg-surface border border-line rounded-md">
              <div className="h-10 bg-danger rounded-sm mb-2" />
              <div className="font-semibold">danger</div>
              <div className="text-ink-muted font-mono">#C62828</div>
            </div>
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            2. Typography Scale
          </h2>
          <div className="bg-surface border border-line rounded-lg p-6 space-y-6">
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Display Title (clamp 2.5rem to 4.25rem)</span>
              <p className="display-title">Ergonomic Office Chairs</p>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Heading 1 (clamp 2rem to 3rem)</span>
              <h1>Precision Hardware & Accessories</h1>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Heading 2 (clamp 1.5rem to 2rem)</span>
              <h2>Featured Workstation Desks</h2>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Heading 3 (1.25rem / 20px)</span>
              <h3>Technical Specifications & Overview</h3>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Body Text (16px base, Public Sans)</span>
              <p className="text-ink text-base max-w-2xl">
                All components are built with premium materials. Physical units are held in our Accra warehouse and backed by manufacturer warranty.
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-muted block mb-1">Mono & Tabular Numbers (IBM Plex Mono)</span>
              <div className="flex flex-wrap gap-6 items-center">
                <span className="mono-specs text-ink-muted">SKU: MB-CHAIR-ERG01</span>
                <Price amount={245000} className="text-lg" />
                <Price amount={189000} dropZeroCents className="text-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons & Actions */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            3. Buttons & States (44px min touch target)
          </h2>
          <div className="bg-surface border border-line rounded-lg p-6 space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">
                Add to cart
              </Button>
              <Button variant="secondary">
                View specifications
              </Button>
              <Button variant="accent">
                Claim offer
              </Button>
              <Button variant="destructive">
                Remove item
              </Button>
              <Button variant="ghost">
                Cancel
              </Button>
              <Button variant="tertiary">
                Read guide
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="border-t border-line pt-4 flex flex-wrap gap-4 items-center">
              <Button size="sm" variant="secondary">Small (36px)</Button>
              <Button size="md" variant="secondary">Medium (44px)</Button>
              <Button size="lg" variant="primary">Large (52px)</Button>
              <Button loading loadingText="Saving..." variant="primary">Submit</Button>
              <Button disabled variant="primary">Disabled</Button>
            </div>
          </div>
        </section>

        {/* 4. Badges */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            4. Badges (4px radius, strictly functional)
          </h2>
          <div className="bg-surface border border-line rounded-lg p-6 flex flex-wrap gap-3">
            <Badge variant="sale">Sale — Save GH₵ 150</Badge>
            <Badge variant="warning">Low stock (3 left)</Badge>
            <Badge variant="success">In stock</Badge>
            <Badge variant="secondary">Pickup ready</Badge>
            <Badge variant="destructive">Out of stock</Badge>
            <Badge variant="outline">Warranty 12 mos</Badge>
          </div>
        </section>

        {/* 5. Inputs & Form Controls */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            5. Form Controls (44px height, line-strong border)
          </h2>
          <div className="bg-surface border border-line rounded-lg p-6 space-y-6 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Recipient phone number</Label>
              <Input id="demo-input" placeholder="024 123 4567" />
              <p className="text-xs text-ink-muted">For delivery notifications via SMS.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-input-err">Full street address</Label>
              <Input id="demo-input-err" defaultValue="Spintex Road" className="border-danger focus-visible:ring-danger" />
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please include house number or landmark.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-textarea">Delivery directions</Label>
              <Textarea id="demo-textarea" placeholder="Near shell petrol station..." />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="demo-terms" defaultChecked />
              <label htmlFor="demo-terms" className="text-sm text-ink cursor-pointer">
                Save this address for future checkouts
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="demo-switch">WhatsApp order notifications</Label>
                <p className="text-xs text-ink-muted">Receive dispatch updates on WhatsApp.</p>
              </div>
              <Switch id="demo-switch" defaultChecked />
            </div>
          </div>
        </section>

        {/* 6. Cards & Static Skeletons */}
        <section className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-ink border-b border-line pb-2">
            6. Cards & Static Skeletons (8px radius, no rest shadow)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="sale">20% off</Badge>
                  <span className="mono-specs text-ink-muted">ACCRA-WH</span>
                </div>
                <CardTitle className="mt-2">Logitech MX Master 3S</CardTitle>
                <CardDescription>Wireless Performance Mouse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <Price amount={125000} className="text-xl font-bold" />
                  <span className="text-xs text-ink-muted line-through font-mono">
                    GH₵ 1,500.00
                  </span>
                </div>
                <Button fullWidth variant="primary">
                  <ShoppingBag className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Add to cart
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
