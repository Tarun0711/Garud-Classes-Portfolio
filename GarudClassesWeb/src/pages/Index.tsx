import TopInfoBar from "@/components/TopInfoBar";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import ResultsSection from "@/components/ResultsSection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TopInfoBar />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <ResultsSection />
      <TeamSection />
      <Footer />
    </div>
  );
};

export default Index;
