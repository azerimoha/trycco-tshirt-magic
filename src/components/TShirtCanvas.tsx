
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

const SHIRT_IMAGES = {
  Black: "/lovable-uploads/1f35303a-6f59-4852-bc09-d34abd1d990e.png",
  White: "/lovable-uploads/f3dcf279-ebb6-4d4f-8ed2-19e65f89c964.png",
};

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

    // Set fixed dimensions for the canvas
    const canvasWidth = 300;
    const canvasHeight = 300;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#f8f9fa",
    });

    fabricRef.current = canvas;

    // Load t-shirt background based on selected color
    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      // Calculate proper positioning to center the shirt
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Maintain aspect ratio while fitting within canvas
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.85;
      
      // Center the image
      const left = (canvasWidth - imgWidth * scale) / 2;
      const top = (canvasHeight - imgHeight * scale) / 2;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: left,
        top: top,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });
      
      canvas.add(img);
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
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
      const maxDimension = 150; // Smaller to fit on the t-shirt
      const scale = Math.min(
        maxDimension / img.width!,
        maxDimension / img.height!
      );

      // Center the design on the canvas
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      img.scale(scale);
      img.set({
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2.5, // Position slightly higher on the shirt
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
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative w-full max-w-[300px] mx-auto">
          <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm flex items-center justify-center">
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>
        <Button onClick={handleCheckout} className="w-full max-w-[300px]">
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
