import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Users, Award } from "lucide-react";
import { BannerDto, fetchBanners } from "@/lib/api";
import heroBuilding from "@/assets/hero-building.jpg";
import heroClassroom from "@/assets/hero-classroom.jpg";
import heroSuccess from "@/assets/hero-success.jpg";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<BannerDto[]>([]);

  // Load banners from backend API
  useEffect(() => {
    const loadBanners = async () => {
      console.log('Loading banners from backend...');
      try {
        const data = await fetchBanners();
        console.log('Received banners data:', data);
        
        // Normalize and filter active banners (treat missing isActive as true)
        const normalized = data.map((b) => ({
          ...b,
          isActive: b.isActive ?? true,
          order: typeof b.order === 'number' ? b.order : 0,
        }));
        let activeBanners = normalized.filter((b) => b.isActive);
        if (activeBanners.length === 0 && normalized.length > 0) {
          console.log('No banners marked active. Falling back to all banners.');
          activeBanners = normalized;
        }
        activeBanners.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        console.log('Active banners after filtering:', activeBanners);
        setBanners(activeBanners);
        try {
          localStorage.setItem('gc_banners', JSON.stringify(activeBanners));
        } catch {}
      } catch (error) {
        console.error('Failed to load banners:', error);
        // Fallback: try to load from localStorage if backend fails
        try {
          const raw = localStorage.getItem('gc_banners');
          if (raw) {
            const parsed = JSON.parse(raw);
            const normalized = parsed.map((b: any) => ({
              ...b,
              isActive: b.isActive ?? true,
              order: typeof b.order === 'number' ? b.order : 0,
            }));
            let activeBanners = normalized.filter((b: any) => b.isActive);
            if (activeBanners.length === 0 && normalized.length > 0) {
              activeBanners = normalized;
            }
            activeBanners.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            console.log('Fallback: loaded banners from localStorage:', activeBanners);
            setBanners(activeBanners);
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError);
        }
      }
    };

    loadBanners();
  }, []);

  // Only show banners from backend - no default slides
  const getSlides = () => {
    console.log('getSlides called with banners:', banners);
    
    const defaultSlides = [
      {
        image: heroBuilding,
        title: 'Excellence in Education',
        subtitle: "Transform your dreams into reality with India's top coaching institute",
        cta: 'Get Started',
        highlight: 'Featured',
        linkUrl: undefined as string | undefined,
      },
      {
        image: heroClassroom,
        title: 'Expert Faculty, Modern Classrooms',
        subtitle: 'Learn from the best with state-of-the-art facilities',
        cta: 'Explore Courses',
        highlight: 'Top Choice',
        linkUrl: undefined as string | undefined,
      },
      {
        image: heroSuccess,
        title: 'Proven Results',
        subtitle: '95% success rate with thousands of happy students',
        cta: 'Join Now',
        highlight: 'Success Stories',
        linkUrl: undefined as string | undefined,
      },
    ];

    // If no banners from backend, use default slides
    if (banners.length === 0) {
      console.log('No banners available from backend. Using default slides.');
      return defaultSlides;
    }

    // Return banners from backend
    return banners.map(banner => ({
      image: banner.imageUrl ?? (banner.image?.path as string) ?? '',
      title: banner.title,
      subtitle: banner.subtitle || '',
      cta: banner.linkUrl ? "Learn More" : "Get Started",
      highlight: banner.tag || "Featured",
      linkUrl: banner.linkUrl
    }));
  };

  const slides = getSlides();
  
  // Debug: Log current state
  useEffect(() => {
    console.log('Current banners state:', banners);
    console.log('Current slides:', slides);
  }, [banners, slides]);

  // If no slides available, show a simple hero section
  if (slides.length === 0) {
    return (
      <section id="home" className="relative h-screen overflow-hidden bg-gradient-to-r from-primary to-primary/80">
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="text-white">
                <span className="inline-block px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary font-semibold text-sm mb-6">
                  Welcome to Garud Classes
                </span>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Excellence in Education
                </h1>
                
                <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl leading-relaxed">
                  Transform your dreams into reality with India's top coaching institute
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button className="btn-hero text-lg px-8 py-4">
                    Get Started
                  </button>
                  <button className="btn-outline-gold text-lg px-8 py-4">
                    Free Demo Class
                  </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center space-x-2 text-white/90">
                    <Star className="w-5 h-5 text-secondary fill-current" />
                    <span className="font-semibold">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <Users className="w-5 h-5 text-secondary" />
                    <span className="font-semibold">1000+ Students</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <Award className="w-5 h-5 text-secondary" />
                    <span className="font-semibold">95% Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white"
            >
              <motion.span 
                className="inline-block px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary font-semibold text-sm mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slides[currentSlide].highlight}
              </motion.span>
              
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {slides[currentSlide].linkUrl ? (
                  <a 
                    href={slides[currentSlide].linkUrl} 
                    target={slides[currentSlide].linkUrl.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="btn-hero text-lg px-8 py-4"
                  >
                    {slides[currentSlide].cta}
                  </a>
                ) : (
                  <button className="btn-hero text-lg px-8 py-4">
                    {slides[currentSlide].cta}
                  </button>
                )}
                <button className="btn-outline-gold text-lg px-8 py-4">
                  Free Demo Class
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="flex flex-wrap gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center space-x-2 text-white/90">
                  <Star className="w-5 h-5 text-secondary fill-current" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2 text-white/90">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">1000+ Students</span>
                </div>
                <div className="flex items-center space-x-2 text-white/90">
                  <Award className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">95% Success Rate</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-secondary scale-125" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;