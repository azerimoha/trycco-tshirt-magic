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
  // Fixed dimensions for normal mode
  const normalSize = 300;

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
    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Scale to fit while maintaining aspect ratio
      const scaleX = normalSize / imgWidth;
      const scaleY = normalSize / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9; // Scale to 90% of the fitting size
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (normalSize - imgWidth * scale) / 2,
        top: (normalSize - imgHeight * scale) / 2,
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
  };

  // Initialize canvas on component mount
  useEffect(() => {
    const canvas = initializeCanvas();
    
    // Handle window resize
    const handleResize = () => {
      if (fabricRef.current && isFullscreen) {
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

  // Adjust canvas size based on container size
  const adjustCanvasSize = () => {
    if (!fabricRef.current || !canvasContainerRef.current) return;
    
    // Store reference to all objects and their positions/scales
    const objects = fabricRef.current.getObjects().slice();
    const objectData = objects.map(obj => ({
      object: obj,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      left: obj.left,
      top: obj.top
    }));
    
    // Get the new dimensions
    let newSize;
    
    if (isFullscreen) {
      // In fullscreen, use the minimum of 80% viewport width or height
      const minViewportDimension = Math.min(window.innerWidth, window.innerHeight);
      newSize = Math.min(minViewportDimension * 0.8, 800); // Cap at 800px max
    } else {
      // In normal mode, use fixed size
      newSize = normalSize;
    }
    
    // Set new dimensions on the canvas
    fabricRef.current.setDimensions({
      width: newSize,
      height: newSize
    });
    
    // Calculate the scale factor
    const scaleFactor = newSize / (isFullscreen ? normalSize : objects[0]?.width || normalSize);
    
    // Reposition and rescale all objects
    objectData.forEach(data => {
      if (data.object instanceof fabric.Image && data.object === objects[0]) {
        // This is the shirt image - handle specially to ensure it fits
        const imgWidth = data.object.width || 0;
        const imgHeight = data.object.height || 0;
        
        // Scale to fit while maintaining aspect ratio
        const scaleX = newSize / imgWidth;
        const scaleY = newSize / imgHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // Scale to 90% of the fitting size
        
        data.object.set({
          scaleX: scale,
          scaleY: scale,
          left: (newSize - imgWidth * scale) / 2,
          top: (newSize - imgHeight * scale) / 2
        });
      } else {
        // For user-added design elements, maintain their position relative to the canvas
        data.object.set({
          scaleX: data.scaleX ? data.scaleX * (newSize / normalSize) : data.scaleX,
          scaleY: data.scaleY ? data.scaleY * (newSize / normalSize) : data.scaleY,
          left: data.left ? data.left * (newSize / normalSize) : data.left,
          top: data.top ? data.top * (newSize / normalSize) : data.top
        });
      }
    });
    
    fabricRef.current.renderAll();
  };

  // Effect for updating shirt color
  useEffect(() => {
    if (!fabricRef.current) return;
    
    // Save all design elements excluding the shirt
    const objects = fabricRef.current.getObjects();
    const shirtObject = objects[0]; // Assuming shirt is always the first object
    const designElements = objects.slice(1);
    
    // Keep track of scales and positions of design elements
    const designPositions = designElements.map(obj => ({
      object: obj,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      left: obj.left,
      top: obj.top,
      angle: obj.angle
    }));
    
    // Remove all objects
    fabricRef.current.clear();
    
    // Load new shirt
    const shirtImage = SHIRT_IMAGES[design.color];
    fabric.Image.fromURL(shirtImage, (img) => {
      if (!fabricRef.current) return;
      
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      
      // Get dimensions
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      // Scale to fit while maintaining aspect ratio
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9; // Scale to 90% of the fitting size
      
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
      
      // Add shirt and all design elements back
      fabricRef.current.add(img);
      
      // Add design elements back
      designPositions.forEach(design => {
        fabricRef.current?.add(design.object);
      });
      
      fabricRef.current.renderAll();
    });
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
    // First update state
    setIsFullscreen(!isFullscreen);
    
    // Then adjust canvas size
    setTimeout(() => {
      adjustCanvasSize();
    }, 50);
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
          className={`relative mx-auto ${isFullscreen ? "max-w-[80vh] w-[80vh] h-[80vh]" : "w-[300px] h-[300px]"} aspect-square`}
        >
          <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm flex items-center justify-center h-full w-full">
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
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
