import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Users, 
  Award,
  Calendar,
  Filter
} from "lucide-react";
import TopInfoBar from "@/components/TopInfoBar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Gallery = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Classroom",
    "Events", 
    "Achievements",
    "Faculty",
    "Infrastructure",
    "Student Life"
  ];

  const galleryImages = [
    {
      id: 1,
      title: "Modern Classroom Session",
      category: "Classroom",
      description: "Students engaged in an interactive JEE Physics session",
      date: "March 2024",
      emoji: "📚"
    },
    {
      id: 2,
      title: "Annual Achievement Ceremony",
      category: "Events",
      description: "Celebrating our top performers of JEE/NEET 2024",
      date: "February 2024",
      emoji: "🏆"
    },
    {
      id: 3,
      title: "AIR 1 JEE Advanced Winner",
      category: "Achievements",
      description: "Our student Arjun Sharma with his achievement certificate",
      date: "January 2024",
      emoji: "🥇"
    },
    {
      id: 4,
      title: "Expert Faculty Team",
      category: "Faculty",
      description: "Our experienced team of subject matter experts",
      date: "March 2024",
      emoji: "👨‍🏫"
    },
    {
      id: 5,
      title: "State-of-the-Art Lab",
      category: "Infrastructure",
      description: "Modern chemistry lab with latest equipment",
      date: "February 2024",
      emoji: "🧪"
    },
    {
      id: 6,
      title: "Study Group Discussion",
      category: "Student Life",
      description: "Students collaborating on problem-solving sessions",
      date: "March 2024",
      emoji: "👥"
    },
    {
      id: 7,
      title: "Mathematics Workshop",
      category: "Classroom",
      description: "Advanced calculus workshop for JEE aspirants",
      date: "March 2024",
      emoji: "📐"
    },
    {
      id: 8,
      title: "NEET Biology Practical",
      category: "Classroom",
      description: "Hands-on biology practical session for NEET students",
      date: "February 2024",
      emoji: "🔬"
    },
    {
      id: 9,
      title: "Parent-Teacher Meeting",
      category: "Events",
      description: "Quarterly progress discussion with parents",
      date: "March 2024",
      emoji: "🤝"
    },
    {
      id: 10,
      title: "Top 10 NEET Rankers",
      category: "Achievements",
      description: "Group photo of our NEET top performers",
      date: "January 2024",
      emoji: "🎯"
    },
    {
      id: 11,
      title: "Digital Learning Center",
      category: "Infrastructure",
      description: "Modern computer lab with online test facilities",
      date: "February 2024",
      emoji: "💻"
    },
    {
      id: 12,
      title: "Cultural Fest 2024",
      category: "Student Life",
      description: "Annual cultural celebration with students and faculty",
      date: "January 2024",
      emoji: "🎭"
    }
  ];

  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : filteredImages.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage < filteredImages.length - 1 ? selectedImage + 1 : 0);
    }
  };

  return (
    <div className="min-h-screen">
      <TopInfoBar />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="heading-section">
              Our <span className="gradient-text-gold">Gallery</span>
            </h1>
            <p className="text-premium text-lg max-w-3xl mx-auto">
              Take a glimpse into our vibrant learning environment, student achievements, 
              and memorable moments at Garud Classes.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { icon: Camera, number: "500+", label: "Photos" },
              { icon: Users, number: "50+", label: "Events Covered" },
              { icon: Award, number: "100+", label: "Achievements" },
              { icon: Calendar, number: "3", label: "Years Archive" }
            ].map((stat, index) => (
              <div key={index} className="card-premium p-4 text-center">
                <stat.icon className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="flex items-center space-x-4 bg-white rounded-xl p-2 shadow-lg">
              <Filter className="w-5 h-5 text-muted-foreground ml-2" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-secondary text-primary shadow-md"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section ref={ref} className="py-12 bg-gradient-to-b from-background to-accent/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="card-course overflow-hidden">
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                    {image.emoji}
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-medium">
                        {image.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{image.date}</span>
                    </div>
                    <h3 className="font-semibold text-primary mb-1 group-hover:text-secondary transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {image.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Container */}
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-9xl">
                  {filteredImages[selectedImage]?.emoji}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                      {filteredImages[selectedImage]?.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {filteredImages[selectedImage]?.date}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {filteredImages[selectedImage]?.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {filteredImages[selectedImage]?.description}
                  </p>
                </div>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {selectedImage + 1} / {filteredImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;