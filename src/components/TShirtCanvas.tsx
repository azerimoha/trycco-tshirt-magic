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
import {
  Maximize,
  Minimize,
  Trash2,
  Plus,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface TShirtCanvasProps {
  design: TShirtDesign;
}

const SHIRT_IMAGES = {
  Black: "/lovable-uploads/1f35303a-6f59-4852-bc09-d34abd1d990e.png",
  White: "/lovable-uploads/f3dcf279-ebb6-4d4f-8ed2-19e65f89c964.png",
};

const WILAYAS = [
  "Alger",
  "Bejaia",
];

const DELIVERY_FEES = {
  bureau: 400,
  home: 600,
};

export function TShirtCanvas({ design }: TShirtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [basePrice] = useState(1900);
  const [deliveryType, setDeliveryType] = useState<"bureau" | "home">("bureau");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = basePrice + DELIVERY_FEES[deliveryType];

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const canvasSide = 300;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSide,
      height: canvasSide,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      const scaleX = canvasSide / imgWidth;
      const scaleY = canvasSide / imgHeight;
      const scale = Math.max(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasSide - imgWidth * scale) / 2,
        top: (canvasSide - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });
      
      canvas.add(img);
      canvas.renderAll();
    });

    canvas.on('selection:created', updateControlVisibility);
    canvas.on('selection:updated', updateControlVisibility);
    canvas.on('selection:cleared', updateControlVisibility);

    return canvas;
  };

  const updateControlVisibility = () => {
    if (!fabricRef.current) return;
  };

  useEffect(() => {
    const canvas = initializeCanvas();
    
    const handleResize = () => {
      if (fabricRef.current) {
        adjustCanvasSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  const adjustCanvasSize = () => {
    if (!fabricRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    let newSize;
    
    if (isFullscreen) {
      const minViewportDimension = Math.min(window.innerWidth, window.innerHeight);
      newSize = minViewportDimension * 0.8;
    } else {
      newSize = 300;
    }
    
    fabricRef.current.setDimensions({
      width: newSize,
      height: newSize
    });
    
    const objects = fabricRef.current.getObjects();
    if (objects.length > 0) {
      const shirtObject = objects[0];
      if (shirtObject instanceof fabric.Image) {
        const imgWidth = shirtObject.width || 1;
        const imgHeight = shirtObject.height || 1;
        
        const scaleX = newSize / imgWidth;
        const scaleY = newSize / imgHeight;
        const scale = Math.max(scaleX, scaleY);
        
        shirtObject.set({
          scaleX: scale,
          scaleY: scale,
          left: (newSize - imgWidth * scale) / 2,
          top: (newSize - imgHeight * scale) / 2
        });
      }
    }
    
    fabricRef.current.renderAll();
  };

  useEffect(() => {
    if (!fabricRef.current) return;
    
    const objects = fabricRef.current.getObjects();
    if (objects.length > 0) {
      const shirtObject = objects[0];
      fabricRef.current.clear();
      fabricRef.current.add(shirtObject);
    }

    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      if (!fabricRef.current) return;
      
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.max(scaleX, scaleY);
      
      const objects = fabricRef.current.getObjects();
      if (objects.length > 0) {
        fabricRef.current.remove(objects[0]);
      }
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });
      
      fabricRef.current.add(img);
      fabricRef.current.sendToBack(img);
      fabricRef.current.renderAll();
    });
  }, [design.color]);

  useEffect(() => {
    if (!design.designUrl || !fabricRef.current) return;
    
    if (fabricRef.current.getObjects().find(obj => {
      return obj instanceof fabric.Image && obj.getSrc() === design.designUrl;
    })) {
      return;
    }

    addImageToCanvas(design.designUrl);
  }, [design.designUrl]);

  const addImageToCanvas = (url: string) => {
    if (!fabricRef.current) return;

    fabric.Image.fromURL(url, (img) => {
      if (!fabricRef.current) return;

      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      const targetWidth = canvasWidth * 0.6;
      const scale = targetWidth / imgWidth;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2.5,
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25MB");
      return;
    }

    const url = URL.createObjectURL(file);
    addImageToCanvas(url);
    toast.success("Design uploaded successfully!");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    setTimeout(() => {
      adjustCanvasSize();
    }, 100);
  };

  const deleteSelectedObject = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    fabricRef.current.remove(activeObject);
    fabricRef.current.renderAll();
    toast.success("Element deleted");
  };

  const moveForward = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    fabricRef.current.bringForward(activeObject);
    fabricRef.current.renderAll();
    toast.success("Moved forward");
  };

  const moveBackward = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    const shirtObject = fabricRef.current.getObjects()[0];
    
    const activeIndex = fabricRef.current.getObjects().indexOf(activeObject);
    const shirtIndex = fabricRef.current.getObjects().indexOf(shirtObject);
    
    if (activeIndex > shirtIndex + 1) {
      fabricRef.current.sendBackwards(activeObject);
      fabricRef.current.renderAll();
      toast.success("Moved backward");
    } else {
      toast.error("Cannot move behind the shirt");
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = () => {
    if (fabricRef.current && fabricRef.current.getObjects().length <= 1) {
      toast.error("Please upload at least one design");
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
      <div 
        ref={containerRef}
        className={`flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
          isFullscreen ? "fixed inset-0 z-50 bg-background/95 p-4" : ""
        }`}
      >
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={moveForward}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={moveBackward}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={deleteSelectedObject}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <label className="rounded-full w-9 h-9 flex items-center justify-center border-2 border-input hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Plus className="h-4 w-4" />
            </label>
          </div>
        </div>
        
        <div className={`relative mx-auto aspect-square ${isFullscreen ? "max-w-[80vh]" : "max-w-[300px] w-full"}`}>
          <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm flex items-center justify-center h-full">
            <canvas ref={canvasRef} className="block max-w-full max-h-full" />
          </div>
        </div>
        
        {!isFullscreen && (
          <Button onClick={handleCheckout} className="w-full max-w-[300px]">
            Proceed to Checkout
          </Button>
        )}
        
        {isFullscreen && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={toggleFullscreen}>
              Close Fullscreen
            </Button>
            <Button onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        )}
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
              <p className="text-xs text-muted-foreground mt-1">More wilayas coming soon</p>
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
