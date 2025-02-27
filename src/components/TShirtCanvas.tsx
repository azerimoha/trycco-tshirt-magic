
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
  Crop,
  RotateCw,
  Trash2,
  Square,
  Circle as CircleIcon,
  Plus,
  Move,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
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
  "Oran",
  "Constantine",
  "Annaba",
  // Add more wilayas as needed
];

const DELIVERY_FEES = {
  bureau: 400,
  home: 600,
};

type EditMode = "normal" | "crop";
type ShapeType = "rectangle" | "circle";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("normal");
  const [selectedShape, setSelectedShape] = useState<ShapeType>("rectangle");
  const containerRef = useRef<HTMLDivElement>(null);

  const total = basePrice + DELIVERY_FEES[deliveryType];

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    // Set fixed dimensions for the canvas
    const canvasWidth = 300;
    const canvasHeight = 300;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true,
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

    // Set up object selection events
    canvas.on('selection:created', updateControlVisibility);
    canvas.on('selection:updated', updateControlVisibility);
    canvas.on('selection:cleared', updateControlVisibility);

    return canvas;
  };

  const updateControlVisibility = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    // We could update UI state based on active object here if needed
  };

  useEffect(() => {
    const canvas = initializeCanvas();
    
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!fabricRef.current) return;
    
    // Clear all designs when color changes
    const objects = fabricRef.current.getObjects();
    if (objects.length > 0) {
      // Keep only the first object (the t-shirt)
      const shirtObject = objects[0];
      fabricRef.current.clear();
      fabricRef.current.add(shirtObject);
    }

    // Reload t-shirt background based on selected color
    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      if (!fabricRef.current) return;
      
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      // Calculate proper positioning to center the shirt
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Maintain aspect ratio while fitting within canvas
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.85;
      
      // Center the image
      const left = (canvasWidth - imgWidth * scale) / 2;
      const top = (canvasHeight - imgHeight * scale) / 2;
      
      // Remove previous shirt
      const objects = fabricRef.current.getObjects();
      if (objects.length > 0) {
        fabricRef.current.remove(objects[0]);
      }
      
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
      
      fabricRef.current.add(img);
      fabricRef.current.sendToBack(img);
      fabricRef.current.renderAll();
    });
  }, [design.color]);

  // Effect to load designs from props
  useEffect(() => {
    if (!design.designUrl || !fabricRef.current) return;
    
    // Only add if this is a new design URL
    if (fabricRef.current.getObjects().find(obj => {
      return obj instanceof fabric.Image && obj.getSrc() === design.designUrl;
    })) {
      return; // Image already exists in canvas
    }

    // Add the image to canvas
    addImageToCanvas(design.designUrl);
  }, [design.designUrl]);

  // Add image to canvas
  const addImageToCanvas = (url: string) => {
    if (!fabricRef.current) return;

    fabric.Image.fromURL(url, (img) => {
      if (!fabricRef.current) return;

      // Position in center of shirt - removed size limitation
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      // Scale while maintaining aspect ratio to fit reasonably on the shirt
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Calculate scale to fit in 60% of canvas width
      const targetWidth = canvasWidth * 0.6;
      const scale = targetWidth / imgWidth;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2.5, // Position slightly higher on the shirt
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerColor: 'rgba(0,0,0,0.5)',
        cornerStrokeColor: '#fff',
        borderColor: '#000',
        cornerSize: 12,
        padding: 10,
        rotatingPointOffset: 40,
      });

      // Apply shape mask if needed
      if (selectedShape === "circle") {
        applyCircleMask(img);
      }

      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
    });
  };

  // Apply circular mask to an image
  const applyCircleMask = (img: fabric.Image) => {
    const width = img.width!;
    const height = img.height!;
    const radius = Math.min(width, height) / 2;
    
    img.clipPath = new fabric.Circle({
      radius: radius,
      originX: 'center',
      originY: 'center',
      left: width / 2,
      top: height / 2,
    });
  };

  // Apply rectangular mask to an image
  const applyRectangleMask = (img: fabric.Image) => {
    img.clipPath = null;
    fabricRef.current?.renderAll();
  };

  // Update shape of selected object
  const changeSelectedObjectShape = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) return;
    
    if (selectedShape === "circle") {
      applyCircleMask(activeObject);
    } else {
      applyRectangleMask(activeObject);
    }
    
    fabricRef.current.renderAll();
  };

  // Effect to apply shape change when selected shape changes
  useEffect(() => {
    changeSelectedObjectShape();
  }, [selectedShape]);

  // Handle file upload for design
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Increased size limit to 25MB
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25MB");
      return;
    }

    const url = URL.createObjectURL(file);
    addImageToCanvas(url);
    toast.success("Design uploaded successfully!");
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Give the browser a moment to update the DOM
    setTimeout(() => {
      if (fabricRef.current) {
        fabricRef.current.setDimensions({
          width: canvasRef.current?.width || 300,
          height: canvasRef.current?.height || 300
        });
        fabricRef.current.renderAll();
      }
    }, 100);
  };

  // Delete selected object
  const deleteSelectedObject = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    fabricRef.current.remove(activeObject);
    fabricRef.current.renderAll();
    toast.success("Element deleted");
  };

  // Rotate selected object
  const rotateSelectedObject = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    activeObject.rotate((activeObject.angle || 0) + 45);
    fabricRef.current.renderAll();
  };

  // Move object slightly in a direction
  const moveObject = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    const moveAmount = 10;
    
    switch (direction) {
      case 'left':
        activeObject.left = (activeObject.left || 0) - moveAmount;
        break;
      case 'right':
        activeObject.left = (activeObject.left || 0) + moveAmount;
        break;
      case 'up':
        activeObject.top = (activeObject.top || 0) - moveAmount;
        break;
      case 'down':
        activeObject.top = (activeObject.top || 0) + moveAmount;
        break;
    }
    
    fabricRef.current.renderAll();
  };

  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Start checkout process
  const handleCheckout = () => {
    if (fabricRef.current && fabricRef.current.getObjects().length <= 1) {
      toast.error("Please upload at least one design");
      return;
    }
    setShowCheckout(true);
  };

  // Confirm order
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
              onClick={() => setSelectedShape(selectedShape === "rectangle" ? "circle" : "rectangle")}
            >
              {selectedShape === "rectangle" ? 
                <Square className="h-4 w-4" /> : 
                <CircleIcon className="h-4 w-4" />
              }
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={rotateSelectedObject}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={deleteSelectedObject}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
                onClick={() => moveObject('left')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
                onClick={() => moveObject('right')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
                onClick={() => moveObject('up')}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
                onClick={() => moveObject('down')}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
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
        
        <div className={`relative mx-auto ${isFullscreen ? "max-w-xl" : "max-w-[300px] w-full"}`}>
          <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm flex items-center justify-center">
            <canvas ref={canvasRef} className="block" />
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
