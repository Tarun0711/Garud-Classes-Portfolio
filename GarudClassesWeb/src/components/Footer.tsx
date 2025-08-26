import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  ChevronRight,
  GraduationCap
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Courses", href: "#courses" },
    { name: "Results", href: "#results" },
    { name: "Gallery", href: "#gallery" },
    { name: "Blog", href: "#blog" },
    { name: "Contact", href: "#contact" },
  ];

  const courses = [
    "JEE Main + Advanced",
    "NEET Complete",
    "Foundation Program",
    "Crash Course",
    "Online Test Series",
    "Doubt Clearing"
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Youtube, href: "#", color: "hover:text-red-500" },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-lg">
              <img 
                src="https://scontent.fixc10-1.fna.fbcdn.net/v/t39.30808-6/492375030_122222600582196191_2514308025161939756_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=iylF-8jjxGgQ7kNvwGTlwGd&_nc_oc=AdkHprgicrKBpw9It1z81L7S98UfexBc56F5ikRvcHyrpDX2U1Z7y-vP5a8PUMO2gHmRY7ufgDHQDbzpZ17SHYaE&_nc_zt=23&_nc_ht=scontent.fixc10-1.fna&_nc_gid=8oGBl4QuJgzh7DA60h21Tg&oh=00_AfUWzUdLgh2xDlnIFAoSgaPg8LwL2VMBKovYcfOp_klS7w&oe=68A20554"
                alt="Garud Classes Logo"
                className="w-full h-full object-cover rounded-xl"
              />
              </div>
              <div>
                <h3 className="text-xl font-bold">Garud Classes</h3>
                <p className="text-sm text-white/70">Excellence in Education</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-6">
              Empowering students for over 15 years to achieve their dreams in engineering 
              and medical fields through expert guidance and proven methodologies.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 transition-all duration-300 ${social.color}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <ChevronRight className="w-5 h-5 text-secondary mr-2" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-secondary rounded-full mr-3 group-hover:w-2 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <GraduationCap className="w-5 h-5 text-secondary mr-2" />
              Our Courses
            </h4>
            <ul className="space-y-3">
              {courses.map((course, index) => (
                <li key={index}>
                  <span className="text-white/80 hover:text-secondary transition-colors duration-300 flex items-center group cursor-pointer">
                    <span className="w-1 h-1 bg-secondary rounded-full mr-3 group-hover:w-2 transition-all duration-300" />
                    {course}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <MapPin className="w-5 h-5 text-secondary mr-2" />
              Contact Info
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/80 leading-relaxed">
                    123 Education Hub, Sector 15,<br />
                    Gurugram, Haryana 122001
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-white/80">+91 98765 43210</p>
                  <p className="text-white/80">+91 87654 32109</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-white/80">info@garudclasses.com</p>
                  <p className="text-white/80">admission@garudclasses.com</p>
                </div>
              </div>
            </div>
            
            {/* Working Hours */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h5 className="font-semibold mb-2 text-secondary">Working Hours</h5>
              <p className="text-sm text-white/80">
                Mon - Sat: 8:00 AM - 8:00 PM<br />
                Sunday: 9:00 AM - 6:00 PM
              </p>
            </div>
          </motion.div>
        </div>

        {/* Google Maps Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <MapPin className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-2">Visit Our Campus</h4>
            <p className="text-white/80 mb-4">
              Experience our world-class facilities and meet our expert faculty
            </p>
            <button className="bg-secondary hover:bg-secondary-dark text-primary font-semibold px-6 py-2 rounded-lg transition-all duration-300">
              Get Directions
            </button>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.p 
              className="text-white/70 text-sm mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              © 2024 Garud Classes. All rights reserved.
            </motion.p>
            <motion.div 
              className="flex space-x-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">Terms of Service</a>
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">Refund Policy</a>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;