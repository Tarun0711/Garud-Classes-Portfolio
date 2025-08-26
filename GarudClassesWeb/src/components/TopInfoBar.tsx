import { Search, Phone, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import LoginModal from "./ui/login-modal";
import { useNavigate } from "react-router-dom";
import { fetchAnnouncements } from "../lib/api";
import logo from '../assets/image.png'
const TopInfoBar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<{ id: string; text: string; emoji?: string }[]>([]);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/admin");
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const list = await fetchAnnouncements();
        if (!isMounted) return;
        const mapped = list
          .filter(a => a.isActive)
          .map(a => ({ id: a._id, text: a.message, emoji: a.emoji }));
        setAnnouncements(mapped);
      } catch {
        // ignore
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-primary text-white">
      {/* Main Info Bar */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold text-primary text-sm">
              <img 
                src={logo}
                alt="Garud Classes Logo"
                className="w-full h-full object-cover rounded-xl"
              />
              </div>
              <span className="font-semibold">Garud Classes</span>
            </div>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search courses, results..." 
                className="pl-10 pr-4 py-1 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">+91 98765 43210</span>
            </div>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticker Bar */}
      <div className="bg-secondary text-primary py-2 overflow-hidden">
        {announcements.length > 0 ? (
          <motion.div
            className="whitespace-nowrap"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
                         <span className="text-sm font-medium">
               {announcements
                 .map((a) => `${a.emoji || "📢"} ${a.text}`)
                 .join(" • ")}
             </span>
          </motion.div>
        ) : (
          <motion.div
            className="whitespace-nowrap"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-medium">⏳ Loading announcements…</span>
          </motion.div>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default TopInfoBar;