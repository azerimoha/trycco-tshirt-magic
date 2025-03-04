import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TShirtCanvas } from "@/components/TShirtCanvas";
import { toast } from "sonner";
import { Palette, Ruler, Upload, Save, ShoppingCart } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NavExtension from "@/components/NavExtension";

const sizes = ["S", "M", "L", "XL", "XXL"] as const;
const colors = ["Black", "White"] as const;

type Size = typeof sizes[number];
type Color = typeof colors[number];

export interface TShirtDesign {
  size: Size;
  color: Color;
  designUrl: string | null;
}

// A simple database implementation using localStorage
// In a real app, this would be replaced with actual API calls to a backend
const saveDesignToLocalStorage = (name: string, design: TShirtDesign) => {
  try {
    // Load existing submissions
    const savedSubmissions = localStorage.getItem("designSubmissions");
    let submissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
    
    // Create a new submission
    const newSubmission = {
      id: `SUB${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      status: "Pending",
      submittedDate: new Date().toISOString().split('T')[0],
      design,
    };
    
    // Add the new submission
    submissions = [newSubmission, ...submissions];
    
    // Save back to localStorage
    localStorage.setItem("designSubmissions", JSON.stringify(submissions));
    
    return true;
  } catch (error) {
    console.error("Failed to save design:", error);
    return false;
  }
};

const addToCartInLocalStorage = (design: TShirtDesign) => {
  try {
    // Load existing orders
    const savedOrders = localStorage.getItem("tshirtOrders");
    let orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Create a new order
    const newOrder = {
      id: `ORD${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: "Processing",
      total: 2500,
      items: [
        {
          id: `ITEM${Math.floor(1000 + Math.random() * 9000)}`,
          name: "Custom T-Shirt",
          quantity: 1,
          price: 2500,
          design,
        },
      ],
    };
    
    // Add the new order
    orders = [newOrder, ...orders];
    
    // Save back to localStorage
    localStorage.setItem("tshirtOrders", JSON.stringify(orders));
    
    return true;
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return false;
  }
};

const Customizer = () => {
  const [design, setDesign] = useState<TShirtDesign>({
    size: "M",
    color: "Black",
    designUrl: null,
  });
  
  const [designName, setDesignName] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

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
  
  const handleSubmitDesign = () => {
    if (!designName.trim()) {
      toast.error("Please enter a name for your design");
      return;
    }
    
    if (!design.designUrl) {
      toast.error("Please upload a design first");
      return;
    }
    
    const success = saveDesignToLocalStorage(designName, design);
    
    if (success) {
      toast.success("Design submitted successfully!");
      setIsSubmitDialogOpen(false);
      // In a real app, you might redirect to the profile page
    } else {
      toast.error("Failed to submit design. Please try again.");
    }
  };
  
  const handleAddToCart = () => {
    // In a real app, we would validate more thoroughly
    if (!design.designUrl) {
      toast.error("Please upload a design first");
      return;
    }
    
    const success = addToCartInLocalStorage(design);
    
    if (success) {
      toast.success("Added to cart successfully!");
      // In a real app, you might redirect to the cart page
    } else {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  return (
    <>
      <NavExtension />
      <div className="container mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-6rem)]">
        <div className="animate-fade-in max-w-md mx-auto">
          <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl text-center md:text-left">Customize Your T-Shirt</h1>
          
          <div className="flex flex-col gap-6">
            <div className="flex justify-center gap-3">
              <div className="relative">
                <TooltipProvider>
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select T-shirt size</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                  {design.size}
                </span>
              </div>

              <div className="relative">
                <TooltipProvider>
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select T-shirt color</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                  {design.color}
                </span>
              </div>

              <div className="relative">
                <TooltipProvider>
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                      <label className="w-12 h-12 rounded-full border-2 border-input hover:border-primary transition-colors flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-5 h-5" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload your design (PNG or JPEG)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                  Upload
                </span>
              </div>
            </div>

            <div className="mt-8">
              <TShirtCanvas design={design} />
            </div>
            
            <div className="flex gap-3 mt-2">
              <TooltipProvider>
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleAddToCart} 
                      className="flex-1"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add this design to your shopping cart</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <TooltipProvider>
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          Save Design
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save your design to your profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Save Your Design</DialogTitle>
                    <DialogDescription>
                      Give your design a name to save it to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        className="col-span-3"
                        placeholder="Summer Collection 2024"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitDesign}>
                      Submit Design
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Customizer;
