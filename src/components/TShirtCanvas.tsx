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

const PRINT_AREA = {
  topOffset: 246,
  bottomOffset: 148,
  sideOffset: 277
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
  const printAreaRef = useRef<fabric.Rect | null>(null);
  
  const normalSize = 300;
  const [canvasSize, setCanvasSize] = useState(normalSize);

  const total = basePrice + DELIVERY_FEES[deliveryType];

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: normalSize,
      height: normalSize,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    loadTShirtImage(design.color, canvas);

    canvas.on('selection:created', updateControlVisibility);
    canvas.on('selection:updated', updateControlVisibility);
    canvas.on('selection:cleared', updateControlVisibility);
    
    addPrintAreaIndicator(canvas);

    canvas.on('object:moving', enforceDesignBoundaries);
    canvas.on('object:scaling', enforceDesignBoundaries);
    canvas.on('object:rotating', enforceDesignBoundaries);

    return canvas;
  };

  const addPrintAreaIndicator = (canvas: fabric.Canvas) => {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const scaleFactor = canvasWidth / 800;
    
    const printAreaWidth = canvasWidth - (PRINT_AREA.sideOffset * 2 * scaleFactor);
    const printAreaHeight = canvasHeight - (PRINT_AREA.topOffset + PRINT_AREA.bottomOffset) * scaleFactor;
    
    const printArea = new fabric.Rect({
      left: PRINT_AREA.sideOffset * scaleFactor,
      top: PRINT_AREA.topOffset * scaleFactor,
      width: printAreaWidth,
      height: printAreaHeight,
      fill: 'rgba(0,0,0,0)',
      stroke: 'rgba(0,0,0,0)',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
    
    canvas.add(printArea);
    canvas.sendToBack(printArea);
    printAreaRef.current = printArea;
    
    return printArea;
  };

  const enforceDesignBoundaries = (options: any) => {
    if (!printAreaRef.current || !fabricRef.current) return;
    
    const obj = options.target;
    if (!obj || obj === printAreaRef.current) return;
    
    const printArea = printAreaRef.current;
    const objBounds = obj.getBoundingRect();
    
    const printBounds = printArea.getBoundingRect();
    
    let modified = false;
    
    if (objBounds.left < printBounds.left) {
      obj.set({ left: obj.left + (printBounds.left - objBounds.left) });
      modified = true;
    } else if (objBounds.left + objBounds.width > printBounds.left + printBounds.width) {
      obj.set({ left: obj.left - ((objBounds.left + objBounds.width) - (printBounds.left + printBounds.width)) });
      modified = true;
    }
    
    if (objBounds.top < printBounds.top) {
      obj.set({ top: obj.top + (printBounds.top - objBounds.top) });
      modified = true;
    } else if (objBounds.top + objBounds.height > printBounds.top + printBounds.height) {
      obj.set({ top: obj.top - ((objBounds.top + objBounds.height) - (printBounds.top + printBounds.height)) });
      modified = true;
    }
    
    if (modified) {
      fabricRef.current.requestRenderAll();
    }
  };

  const loadTShirtImage = (color: string, canvas: fabric.Canvas) => {
    const shirtImage = SHIRT_IMAGES[color as keyof typeof SHIRT_IMAGES];
    
    fabric.Image.fromURL(shirtImage, (img) => {
      if (!fabricRef.current) return;
      
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      const scaleX = canvas.getWidth() / imgWidth;
      const scaleY = canvas.getHeight() / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9;
      
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
      
      if (fabricRef.current.getObjects().length > 0 && fabricRef.current.getObjects()[0] instanceof fabric.Image) {
        fabricRef.current.remove(fabricRef.current.getObjects()[0]);
      }
      
      canvas.add(img);
      canvas.sendToBack(img);
      
      updatePrintAreaAfterResize();
      
      canvas.renderAll();
    });
  };

  const updatePrintAreaAfterResize = () => {
    if (!fabricRef.current || !printAreaRef.current) return;
    
    const canvas = fabricRef.current;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const scaleFactor = canvasWidth / 800;
    
    const printAreaWidth = canvasWidth - (PRINT_AREA.sideOffset * 2 * scaleFactor);
    const printAreaHeight = canvasHeight - (PRINT_AREA.topOffset + PRINT_AREA.bottomOffset) * scaleFactor;
    
    printAreaRef.current.set({
      left: PRINT_AREA.sideOffset * scaleFactor,
      top: PRINT_AREA.topOffset * scaleFactor,
      width: printAreaWidth,
      height: printAreaHeight
    });
  };

  const updateControlVisibility = () => {
    if (!fabricRef.current) return;
  };

  useEffect(() => {
    const canvas = initializeCanvas();
    
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

  const recalculateCanvasSize = () => {
    if (!containerRef.current) return;
    
    let newSize;
    
    if (isFullscreen) {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      newSize = Math.min(minDimension * 0.8, 800);
    } else {
      newSize = normalSize;
    }
    
    setCanvasSize(newSize);
    
    if (fabricRef.current) {
      resizeCanvas(newSize);
    }
  };

  const resizeCanvas = (newSize: number) => {
    if (!fabricRef.current) return;
    
    const canvas = fabricRef.current;
    const oldSize = canvas.getWidth();
    const scaleFactor = newSize / oldSize;
    
    const objects = canvas.getObjects();
    const shirtImage = objects[0];
    const printArea = printAreaRef.current;
    const designs = objects.filter(obj => obj !== shirtImage && obj !== printArea);
    
    const designData = designs.map(obj => ({
      obj,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle
    }));
    
    canvas.setDimensions({
      width: newSize,
      height: newSize
    });
    
    if (shirtImage) {
      loadTShirtImage(design.color, canvas);
    }
    
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
    
    updatePrintAreaAfterResize();
    
    canvas.renderAll();
  };

  useEffect(() => {
    recalculateCanvasSize();
  }, [isFullscreen]);

  useEffect(() => {
    if (!fabricRef.current) return;
    
    const objects = fabricRef.current.getObjects();
    const printArea = printAreaRef.current;
    const designElements = objects.filter(obj => obj !== objects[0] && obj !== printArea);
    
    const designData = designElements.map(obj => ({
      object: obj,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle
    }));
    
    loadTShirtImage(design.color, fabricRef.current);
    
    setTimeout(() => {
      if (!fabricRef.current) return;
      
      designData.forEach(data => {
        fabricRef.current?.add(data.object);
      });
      
      fabricRef.current.renderAll();
    }, 50);
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
    if (!fabricRef.current || !printAreaRef.current) return;

    fabric.Image.fromURL(url, (img) => {
      if (!fabricRef.current || !printAreaRef.current) return;

      const printArea = printAreaRef.current;
      const printBounds = printArea.getBoundingRect();
      
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;
      
      const targetWidth = printBounds.width * 0.7;
      const scale = targetWidth / imgWidth;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: printBounds.left + (printBounds.width - imgWidth * scale) / 2,
        top: printBounds.top + (printBounds.height - imgHeight * scale) / 2,
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
      toast.success("Moved backward", {
        position: "bottom-center",
      });
    } else {
      toast.error("Cannot move behind the shirt", {
        position: "bottom-center",
      });
    }
  };

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

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = () => {
    if (fabricRef.current && fabricRef.current.getObjects().length <= 1) {
      toast.error("Please upload at least one design", {
        position: "bottom-center",
      });
      return;
    }
    setShowCheckout(true);
  };

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
          <div className="flex items-center justify-center h-full w-full">
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
