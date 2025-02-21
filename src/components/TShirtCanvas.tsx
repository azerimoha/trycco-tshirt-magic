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
import { toast } from "sonner";

interface TShirtCanvasProps {
  design: TShirtDesign;
}

export function TShirtCanvas({ design }: TShirtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [total, setTotal] = useState(2500);

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

  const handleCheckout = () => {
    if (!design.designUrl) {
      toast.error("Please upload a design first");
      return;
    }
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    toast.success("Order placed successfully!");
    setShowCheckout(false);
  };

  return (
    <>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="relative rounded-lg border bg-white p-4 shadow-sm">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
        <Button onClick={handleCheckout} className="w-full max-w-xs">
          Proceed to Checkout
        </Button>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Review your custom t-shirt order details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span>Custom T-Shirt ({design.size})</span>
              <span>{total.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{total.toLocaleString()} DA</span>
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
