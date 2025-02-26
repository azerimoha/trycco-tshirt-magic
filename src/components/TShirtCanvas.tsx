import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import type { TShirtDesign } from "@/pages/Customizer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TShirtCanvasProps {
  design: TShirtDesign;
}

const WILAYAS = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  // Add more wilayas as needed
];

const DELIVERY_FEES = {
  bureau: 400,
  home: 600,
};

export function TShirtCanvas({ design }: TShirtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [basePrice] = useState(2500);
  const [deliveryType, setDeliveryType] = useState<"bureau" | "home">("bureau");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
  });

  const total = basePrice + DELIVERY_FEES[deliveryType];

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize interactive canvas
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: "#f8f9fa",
    });

    // Load t-shirt background
    fabric.Image.fromURL("/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png", (img) => {
      img.scaleToWidth(400);
      img.set({
        selectable: false,
        evented: false,
      });
      fabricRef.current?.add(img);
      fabricRef.current?.renderAll();
    });

    return () => {
      fabricRef.current?.dispose();
    };
  }, [design.color]);

  useEffect(() => {
    if (!design.designUrl || !fabricRef.current) return;

    // Remove previous design if any
    const objects = fabricRef.current.getObjects();
    if (objects.length > 1) {
      fabricRef.current.remove(objects[1]);
    }

    fabric.Image.fromURL(design.designUrl, (img) => {
      if (!fabricRef.current) return;

      // Scale image to fit within boundaries while maintaining aspect ratio
      const maxDimension = 200;
      const scale = Math.min(
        maxDimension / img.width!,
        maxDimension / img.height!
      );

      img.scale(scale);

      // Make the design interactive
      img.set({
        left: (fabricRef.current.getWidth() - img.width! * scale) / 2,
        top: (fabricRef.current.getHeight() - img.height! * scale) / 2,
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerColor: 'rgba(0,0,0,0.5)',
        cornerStrokeColor: '#fff',
        borderColor: '#000',
        cornerSize: 12,
        padding: 10,
        rotatingPointOffset: 40,
      });

      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
    });
  }, [design.designUrl]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = () => {
    if (!design.designUrl) {
      toast.error("Please upload a design first");
      return;
    }
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.wilaya) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Order placed successfully!");
    setShowCheckout(false);
  };

  return (
    <>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="relative rounded-lg border bg-white p-4 shadow-sm w-full max-w-md mx-auto">
          <canvas ref={canvasRef} className="w-full" />
        </div>
        <Button onClick={handleCheckout} className="w-full max-w-xs">
          Proceed to Checkout
        </Button>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Please provide your delivery details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wilaya">Wilaya</Label>
              <Select
                value={formData.wilaya}
                onValueChange={(value) => handleFormChange("wilaya", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((wilaya) => (
                    <SelectItem key={wilaya} value={wilaya}>
                      {wilaya}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery Type</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "bureau"}
                    onChange={() => setDeliveryType("bureau")}
                    className="rounded-full"
                  />
                  Bureau Delivery ({DELIVERY_FEES.bureau.toLocaleString()} DA)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "home"}
                    onChange={() => setDeliveryType("home")}
                    className="rounded-full"
                  />
                  Home Delivery ({DELIVERY_FEES.home.toLocaleString()} DA)
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <span>T-Shirt ({design.size})</span>
                <span>{basePrice.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{DELIVERY_FEES[deliveryType].toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total</span>
                <span>{total.toLocaleString()} DA</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder}>
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
