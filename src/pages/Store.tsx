
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const weeklyDesigns = [
  {
    id: 1,
    name: "Mountain Sunset",
    designer: "Sarah Smith",
    description: "A minimalist mountain landscape at sunset",
    price: 2500,
    imageUrl: "/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png",
  },
  {
    id: 2,
    name: "Urban Life",
    designer: "John Doe",
    description: "Abstract representation of city life",
    price: 2500,
    imageUrl: "/lovable-uploads/9d489ea9-f724-431e-9623-a7b50c31ca39.png",
  },
];

const Store = () => {
  const handlePurchase = (designId: number) => {
    toast.info("Purchase functionality coming soon!");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="animate-fade-in space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Weekly Featured Designs</h1>
          <p className="text-muted-foreground">
            Shop this week's community-created designs. New designs every week!
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weeklyDesigns.map((design) => (
            <Card key={design.id}>
              <CardHeader>
                <CardTitle>{design.name}</CardTitle>
                <CardDescription>By {design.designer}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="aspect-square w-full rounded-lg object-contain bg-gray-50 p-4"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  {design.description}
                </p>
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

export default Store;
