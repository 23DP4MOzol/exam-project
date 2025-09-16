import { Toaster } from "@/components/ui/toaster";
import ProfessionalMarketplace from "@/components/ProfessionalMarketplace";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Index = () => {
  return (
    <LanguageProvider>
      <div>
        <ProfessionalMarketplace />
        <Toaster />
      </div>
    </LanguageProvider>
  );
};

export default Index;
