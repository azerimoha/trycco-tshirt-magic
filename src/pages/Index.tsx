
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/lovable-uploads/daac08a9-9ae9-4530-bbe2-56a1ea1b1641.png"
          alt="T-shirt background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
      </div>
      
      <div className="animate-fade-in space-y-8 max-w-4xl px-4 py-8 rounded-xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
        <div className="mx-auto flex items-center justify-center">
          <img
            src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
            alt="TRYCO"
            className="h-24 w-auto object-contain sm:h-32"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Design Your Perfect T-Shirt
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Create unique, custom t-shirts with our easy-to-use design tool.
            Express yourself through fashion.
          </p>
        </div>
        <Button
          onClick={() => navigate("/customizer")}
          className="group relative overflow-hidden rounded-full px-6 py-2"
        >
          Start Designing
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
