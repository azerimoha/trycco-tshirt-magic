import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center">
          <img
            src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
            alt="TRYCO"
            className="h-24 w-auto object-contain sm:h-32"
          />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Design Your Perfect T-Shirt
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Create unique, custom t-shirts with our easy-to-use design tool.
            Express yourself through fashion.
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/customizer")}
            className="group relative overflow-hidden rounded-full px-6 py-2"
          >
            Start Designing
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
