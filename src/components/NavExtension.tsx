
import DarkModeToggle from "./DarkModeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NavExtension = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <DarkModeToggle />
    </div>
  );
};

export default NavExtension;
