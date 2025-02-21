
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const featuredDesigns = [
  {
    id: 1,
    name: "Classic Logo",
    description: "Our signature design that never goes out of style",
    price: 2500,
    imageUrl: "/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png",
  },
  {
    id: 2,
    name: "Geometric Abstract",
    description: "Modern geometric patterns in bold colors",
    price: 2500,
    imageUrl: "/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png",
  },
  {
    id: 3,
    name: "Vintage Vibes",
    description: "Retro-inspired artwork with a modern twist",
    price: 2500,
    imageUrl: "/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png",
  },
];

const Featured = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePurchase = (designId: number) => {
    toast.info("Purchase functionality coming soon!");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="animate-fade-in space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Trycco Featured Collection</h1>
          <p className="text-muted-foreground">
            Our permanent collection of carefully curated designs
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featuredDesigns.map((design) => (
            <Card key={design.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>{design.name}</CardTitle>
                <CardDescription>{design.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="aspect-square w-full rounded-lg object-contain bg-gray-50 p-4"
                />
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {design.price.toLocaleString()} DA
                </span>
                <Button
                  onClick={() => handlePurchase(design.id)}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Purchase
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featured;
