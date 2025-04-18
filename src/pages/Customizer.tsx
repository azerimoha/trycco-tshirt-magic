
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TShirtCanvas } from "@/components/TShirtCanvas";
import { toast } from "sonner";
import { Palette, Ruler, Upload } from "lucide-react";

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

    // Increased file size limit to 25MB (25 * 1024 * 1024 bytes)
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setDesign((prev) => ({ ...prev, designUrl: url }));
    toast.success("Design uploaded successfully!");
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="w-full max-w-md px-4 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-6">
          Customize Your T-Shirt
        </h1>
        
        <div className="flex flex-col gap-6">
          <div className="flex justify-center gap-3">
            <div className="relative">
              <Select
                value={design.size}
                onValueChange={(size: Size) =>
                  setDesign((prev) => ({ ...prev, size }))
                }
              >
                <SelectTrigger className="w-12 h-12 rounded-full p-0 border-2">
                  <Ruler className="w-5 h-5 mx-auto" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      Size {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                {design.size}
              </span>
            </div>

            <div className="relative">
              <Select
                value={design.color}
                onValueChange={(color: Color) =>
                  setDesign((prev) => ({ ...prev, color }))
                }
              >
                <SelectTrigger className="w-12 h-12 rounded-full p-0 border-2">
                  <Palette className="w-5 h-5 mx-auto" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                {design.color}
              </span>
            </div>

            <div className="relative">
              <label className="w-12 h-12 rounded-full border-2 border-input hover:border-primary transition-colors flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5" />
              </label>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                Upload
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <TShirtCanvas design={design} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
