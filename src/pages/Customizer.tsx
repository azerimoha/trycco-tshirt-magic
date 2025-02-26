
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TShirtCanvas } from "@/components/TShirtCanvas";
import { toast } from "sonner";

const sizes = ["S", "M", "L", "XL", "XXL"] as const;
const colors = ["Black", "White"] as const;

type Size = typeof sizes[number];
type Color = typeof colors[number];

export interface TShirtDesign {
  size: Size;
  color: Color;
  designUrl: string | null;
}

const Customizer = () => {
  const [design, setDesign] = useState<TShirtDesign>({
    size: "M",
    color: "Black",
    designUrl: null,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setDesign((prev) => ({ ...prev, designUrl: url }));
    toast.success("Design uploaded successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="animate-fade-in">
        <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">Customize Your T-Shirt</h1>
        
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="space-y-4 order-2 md:order-1">
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={design.size}
                onValueChange={(size: Size) =>
                  setDesign((prev) => ({ ...prev, size }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select
                value={design.color}
                onValueChange={(color: Color) =>
                  setDesign((prev) => ({ ...prev, color }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Design</Label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileUpload}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
              <p className="text-sm text-muted-foreground">
                Max file size: 5MB. PNG or JPG only.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <TShirtCanvas design={design} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
