import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { EnrollmentModal } from "./ui/enrollment-modal";
import logo from '../assets/image.png'
const Navigation = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/", id: "home" },
    { name: "About Us", href: "/#about", id: "about" },
    { name: "Courses", href: "/#courses", id: "courses" },
    { name: "Results", href: "/#results", id: "results" },
    // { name: "Gallery", href: "/gallery", id: "gallery" },
    { name: "Blog", href: "/blog", id: "blog" },
    { name: "Contact", href: "/contact", id: "contact" },
  ];

  useEffect(() => {
    // Set active link based on current route
    const currentPath = location.pathname;
    if (currentPath === "/") {
      setActiveLink("home");
    } else if (currentPath === "/blog") {
      setActiveLink("blog");
    } else if (currentPath === "/gallery") {
      setActiveLink("gallery");
    } else if (currentPath === "/contact") {
      setActiveLink("contact");
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2" 
          : "bg-white py-4"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <img 
                src={logo}
                alt="Garud Classes Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Garud Classes</h1>
              <p className="text-xs text-muted-foreground">Excellence in Education</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div key={link.id}>
                {link.href.startsWith("/") && !link.href.includes("#") ? (
                  <Link
                    to={link.href}
                    className={`relative px-3 py-2 font-medium transition-all duration-300 ${
                      activeLink === link.id 
                        ? "text-secondary" 
                        : "text-foreground hover:text-secondary"
                    }`}
                    onClick={() => setActiveLink(link.id)}
                  >
                    {link.name}
                    {activeLink === link.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                        layoutId="activeLink"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`relative px-3 py-2 font-medium transition-all duration-300 ${
                      activeLink === link.id 
                        ? "text-secondary" 
                        : "text-foreground hover:text-secondary"
                    }`}
                    onClick={() => setActiveLink(link.id)}
                  >
                    {link.name}
                    {activeLink === link.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                        layoutId="activeLink"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:block">
            <button 
              className="btn-hero"
              onClick={() => setIsEnrollmentModalOpen(true)}
            >
              Enroll Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden mt-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <div key={link.id}>
                  {link.href.startsWith("/") && !link.href.includes("#") ? (
                    <Link
                      to={link.href}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        activeLink === link.id 
                          ? "bg-secondary/10 text-secondary" 
                          : "text-foreground hover:bg-accent"
                      }`}
                      onClick={() => {
                        setActiveLink(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        activeLink === link.id 
                          ? "bg-secondary/10 text-secondary" 
                          : "text-foreground hover:bg-accent"
                      }`}
                      onClick={() => {
                        setActiveLink(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.name}
                    </a>
                  )}
                </div>
              ))}
              <button 
                className="btn-hero mt-4"
                onClick={() => setIsEnrollmentModalOpen(true)}
              >
                Enroll Now
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Enrollment Modal */}
      <EnrollmentModal 
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
      />
    </motion.nav>
  );
};

export default Navigation;