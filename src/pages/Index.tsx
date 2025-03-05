
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-16rem)] md:h-[calc(100vh-5rem)] flex-col items-center justify-center text-center overflow-hidden">
      <div className="animate-fade-in space-y-8">
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
          <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
