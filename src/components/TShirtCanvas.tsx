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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Fixed canvas dimensions for consistency
  const normalSize = 300;
  const [canvasSize, setCanvasSize] = useState(normalSize);

  const total = basePrice + DELIVERY_FEES[deliveryType];

  // Initialize the fabric canvas
  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: normalSize,
      height: normalSize,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Load t-shirt background based on selected color
    loadTShirtImage(design.color, canvas);

    // Set up object selection events
    canvas.on('selection:created', updateControlVisibility);
    canvas.on('selection:updated', updateControlVisibility);
    canvas.on('selection:cleared', updateControlVisibility);

    return canvas;
  };

  // Helper function to load t-shirt image
  const loadTShirtImage = (color: string, canvas: fabric.Canvas) => {
    const shirtImage = SHIRT_IMAGES[color as keyof typeof SHIRT_IMAGES];
    
    fabric.Image.fromURL(shirtImage, (img) => {
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Scale to fit while maintaining aspect ratio
      const scaleX = canvas.getWidth() / imgWidth;
      const scaleY = canvas.getHeight() / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9; // Scale to 90% of the fitting size
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.getWidth() - imgWidth * scale) / 2,
        top: (canvas.getHeight() - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });
      
      // Remove any existing shirt image (first object)
      const objects = canvas.getObjects();
      if (objects.length > 0 && objects[0] instanceof fabric.Image) {
        canvas.remove(objects[0]);
      }
      
      canvas.add(img);
      canvas.sendToBack(img);
      canvas.renderAll();
    });
  };

  const updateControlVisibility = () => {
    if (!fabricRef.current) return;
  };

  // Initialize canvas on component mount
  useEffect(() => {
    const canvas = initializeCanvas();
    
    // Handle window resize
    const handleResize = () => {
      if (fabricRef.current && isFullscreen) {
        recalculateCanvasSize();
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

  // Calculate appropriate canvas size based on screen dimensions and fullscreen state
  const recalculateCanvasSize = () => {
    if (!containerRef.current) return;
    
    let newSize;
    
    if (isFullscreen) {
      // Calculate a reasonable size for fullscreen mode (80% of min viewport dimension)
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      newSize = Math.min(minDimension * 0.8, 800); // Cap at 800px
    } else {
      newSize = normalSize;
    }
    
    setCanvasSize(newSize);
    
    // Apply new size to canvas if it exists
    if (fabricRef.current) {
      resizeCanvas(newSize);
    }
  };

  // Resize canvas while preserving positions and scales of objects
  const resizeCanvas = (newSize: number) => {
    if (!fabricRef.current) return;
    
    const canvas = fabricRef.current;
    const oldSize = canvas.getWidth();
    const scaleFactor = newSize / oldSize;
    
    // Store all objects except the shirt image
    const objects = canvas.getObjects();
    const shirtImage = objects[0];
    const designs = objects.slice(1);
    
    // Store design object properties before resizing
    const designData = designs.map(obj => ({
      obj,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle
    }));
    
    // Resize the canvas
    canvas.setDimensions({
      width: newSize,
      height: newSize
    });
    
    // Reload the shirt image to fit the new canvas size
    if (shirtImage) {
      loadTShirtImage(design.color, canvas);
    }
    
    // Scale all other objects proportionally
    designData.forEach(data => {
      if (data.obj && data.left !== undefined && data.top !== undefined) {
        data.obj.set({
          left: data.left ? data.left * scaleFactor : data.left,
          top: data.top ? data.top * scaleFactor : data.top,
          scaleX: data.scaleX ? data.scaleX * scaleFactor : data.scaleX,
          scaleY: data.scaleY ? data.scaleY * scaleFactor : data.scaleY
        });
      }
    });
    
    canvas.renderAll();
  };

  // Effect for handling fullscreen toggle
  useEffect(() => {
    recalculateCanvasSize();
  }, [isFullscreen]);

  // Effect for updating shirt color
  useEffect(() => {
    if (!fabricRef.current) return;
    
    // Save all design elements, but not the shirt
    const objects = fabricRef.current.getObjects();
    const designElements = objects.slice(1);
    
    // Keep track of designs' positions and scales
    const designData = designElements.map(obj => ({
      object: obj,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle
    }));
    
    // Load new shirt
    loadTShirtImage(design.color, fabricRef.current);
    
    // Add design elements back (after a small delay to ensure shirt is loaded)
    setTimeout(() => {
      if (!fabricRef.current) return;
      
      // Make sure the designs are still at their correct positions
      designData.forEach(data => {
        fabricRef.current?.add(data.object);
      });
      
      fabricRef.current.renderAll();
    }, 50);
  }, [design.color]);

  // Effect to load designs from props
  useEffect(() => {
    if (!design.designUrl || !fabricRef.current) return;
    
    // Check if this design has already been added
    if (fabricRef.current.getObjects().find(obj => {
      return obj instanceof fabric.Image && obj.getSrc() === design.designUrl;
    })) {
      return; // Image already exists
    }

    addImageToCanvas(design.designUrl);
  }, [design.designUrl]);

  // Add image to canvas
  const addImageToCanvas = (url: string) => {
    if (!fabricRef.current) return;

    fabric.Image.fromURL(url, (img) => {
      if (!fabricRef.current) return;

      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      // Scale image to fit on shirt
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Scale to 50% of canvas width
      const targetWidth = canvasWidth * 0.5;
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Delete selected object
  const deleteSelectedObject = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    fabricRef.current.remove(activeObject);
    fabricRef.current.renderAll();
    toast.success("Element deleted", {
      position: "bottom-center",
    });
  };

  // Move object forward one layer
  const moveForward = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    fabricRef.current.bringForward(activeObject);
    fabricRef.current.renderAll();
    toast.success("Moved forward", {
      position: "bottom-center",
    });
  };

  // Move object backward one layer
  const moveBackward = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;
    
    const shirtObject = fabricRef.current.getObjects()[0];
    
    // Don't allow moving behind the shirt
    const activeIndex = fabricRef.current.getObjects().indexOf(activeObject);
    const shirtIndex = fabricRef.current.getObjects().indexOf(shirtObject);
    
    if (activeIndex > shirtIndex + 1) {
      fabricRef.current.sendBackwards(activeObject);
      fabricRef.current.renderAll();
      toast.success("Moved backward", {
        position: "bottom-center",
      });
    } else {
      toast.error("Cannot move behind the shirt", {
        position: "bottom-center",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25MB", {
        position: "bottom-center",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    addImageToCanvas(url);
    toast.success("Design uploaded successfully!", {
      position: "bottom-center",
    });
  };

  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle checkout
  const handleCheckout = () => {
    if (fabricRef.current && fabricRef.current.getObjects().length <= 1) {
      toast.error("Please upload at least one design", {
        position: "bottom-center",
      });
      return;
    }
    setShowCheckout(true);
  };

  // Handle order confirmation
  const handleConfirmOrder = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.wilaya) {
      toast.error("Please fill in all fields", {
        position: "bottom-center",
      });
      return;
    }
    toast.success("Order placed successfully!", {
      position: "bottom-center",
    });
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
        
        <div 
          ref={canvasContainerRef}
          className="relative mx-auto"
          style={{
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: "1/1"
          }}
        >
          <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm flex items-center justify-center h-full w-full">
            <canvas ref={canvasRef} />
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
