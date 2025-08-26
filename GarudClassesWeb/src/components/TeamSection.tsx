import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Award, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Star,
  Linkedin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchTeamMembers, TeamMemberDto } from "../lib/api";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'https://garud-classes-portfolio.onrender.com';

const TeamSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Load team members from API
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        console.log('Loading team members...');
        const data = await fetchTeamMembers();
        console.log('Loaded team members:', data);
        
        // Ensure all team members have proper image URLs
        const processedData = data.map(member => ({
          ...member,
          imageUrl: member.imageUrl || null
        }));
        
        setTeamMembers(processedData);
      } catch (error) {
        console.error('Failed to load team members:', error);
        // Fallback to empty array
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  // Debug effect to log team members changes
  useEffect(() => {
    console.log('Team members state updated:', teamMembers);
    teamMembers.forEach(member => {
      if (member.imageUrl) {
        console.log(`Team member ${member.name} has image URL:`, member.imageUrl);
        // Test if the image URL is accessible
        const img = new Image();
        img.onload = () => console.log(`✅ Image URL is accessible for ${member.name}:`, member.imageUrl);
        img.onerror = () => console.log(`❌ Image URL is NOT accessible for ${member.name}:`, member.imageUrl);
        img.src = `${API_BASE}${member.imageUrl}`;
      } else {
        console.log(`Team member ${member.name} has no image URL`);
      }
    });
  }, [teamMembers]);

  // Fallback team members if API fails
  const fallbackTeamMembers = [
    {
      name: "Dr. Rajesh Kumar",
      position: "Director & Chief Mentor",
      experience: "20+ Years",
      specialization: "JEE Advanced Expert",
      image: "👨‍🏫",
      achievements: ["PhD in Physics", "IIT Delhi Alumni", "1000+ Selections"],
      contact: {
        email: "rajesh@garudclasses.com",
        phone: "+91 98765 43210",
        linkedin: "linkedin.com/in/rajeshkumar"
      },
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Prof. Priya Sharma",
      position: "Head of Chemistry",
      experience: "18+ Years",
      specialization: "NEET Specialist",
      image: "👩‍🔬",
      achievements: ["MSc Chemistry", "AIIMS Experience", "95% Success Rate"],
      contact: {
        email: "priya@garudclasses.com",
        phone: "+91 98765 43211",
        linkedin: "linkedin.com/in/priyasharma"
      },
      color: "from-green-500 to-teal-600"
    },
    {
      name: "Dr. Amit Patel",
      position: "Mathematics Lead",
      experience: "15+ Years",
      specialization: "JEE Main Expert",
      image: "👨‍💻",
      achievements: ["PhD in Mathematics", "IIT Bombay", "Author of 5 Books"],
      contact: {
        email: "amit@garudclasses.com",
        phone: "+91 98765 43212",
        linkedin: "linkedin.com/in/amitpatel"
      },
      color: "from-orange-500 to-red-600"
    },
    {
      name: "Dr. Meera Singh",
      position: "Biology Head",
      experience: "16+ Years",
      specialization: "NEET Biology",
      image: "👩‍⚕️",
      achievements: ["MBBS, MD", "AIIMS Faculty", "Medical Research"],
      contact: {
        email: "meera@garudclasses.com",
        phone: "+91 98765 43213",
        linkedin: "linkedin.com/in/meerasingh"
      },
      color: "from-purple-500 to-pink-600"
    },
    {
      name: "Prof. Sanjay Verma",
      position: "Physics Department Head",
      experience: "17+ Years",
      specialization: "JEE Advanced Physics",
      image: "👨‍🔬",
      achievements: ["MSc Physics", "IIT Kanpur", "Olympiad Trainer"],
      contact: {
        email: "sanjay@garudclasses.com",
        phone: "+91 98765 43214",
        linkedin: "linkedin.com/in/sanjayverma"
      },
      color: "from-indigo-500 to-blue-600"
    },
    {
      name: "Dr. Kavita Reddy",
      position: "Student Success Manager",
      experience: "12+ Years",
      specialization: "Career Counseling",
      image: "👩‍💼",
      achievements: ["PhD in Education", "Career Expert", "1000+ Students Guided"],
      contact: {
        email: "kavita@garudclasses.com",
        phone: "+91 98765 43215",
        linkedin: "linkedin.com/in/kavitareddy"
      },
      color: "from-emerald-500 to-green-600"
    }
  ];

  const stats = [
    {
      icon: Users,
      number: "50+",
      label: "Expert Faculty",
      color: "text-blue-500"
    },
    {
      icon: Award,
      number: "1000+",
      label: "Student Selections",
      color: "text-green-500"
    },
    {
      icon: Star,
      number: "95%",
      label: "Success Rate",
      color: "text-purple-500"
    },
    {
      icon: GraduationCap,
      number: "15+",
      label: "Years Experience",
      color: "text-orange-500"
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(teamMembers.length / 3));
    }, 3000);

    return () => clearInterval(interval);
  }, [teamMembers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(teamMembers.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(teamMembers.length / 3)) % Math.ceil(teamMembers.length / 3));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Calculate how many slides we need
  const totalSlides = Math.ceil(teamMembers.length / 3);

  // Show loading state if still loading
  if (loading) {
    return (
      <section id="team" className="py-20 bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading team members...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show message if no team members
  if (teamMembers.length === 0) {
    return (
      <section id="team" className="py-20 bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <span className="text-secondary font-semibold text-lg mb-2 block">Our Team</span>
            <h2 className="heading-section">
              Meet Our <span className="gradient-text-gold">Expert Faculty</span>
            </h2>
            <p className="text-premium text-lg max-w-3xl mx-auto mt-4">
              No team members available at the moment. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="py-20 bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold text-lg mb-2 block">Our Team</span>
          <h2 className="heading-section">
            Meet Our <span className="gradient-text-gold">Expert Faculty</span>
          </h2>
          <p className="text-premium text-lg max-w-3xl mx-auto">
            Our team of experienced educators, researchers, and mentors are dedicated to 
            transforming students' dreams into reality through personalized guidance and proven methodologies.
          </p>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="card-premium p-6 text-center group hover:scale-105"
            >
              <div className={`inline-flex p-3 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 mb-4 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Carousel - Multiple Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-7xl mx-auto mb-16"
        >
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Create slides with 3 cards each */}
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    {teamMembers.slice(slideIndex * 3, slideIndex * 3 + 3).map((member, index) => (
                      <motion.div
                        key={member.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        className="card-premium p-6 group hover:scale-105 transition-all duration-300"
                      >
                        {/* Member Header */}
                        <div className="text-center mb-4">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100">
                            {member.imageUrl ? (
                              <img 
                                src={`${API_BASE}${member.imageUrl}`} 
                                alt={member.name} 
                                className="w-full h-full object-cover"
                                onLoad={() => console.log(`Image loaded successfully for ${member.name}:`, member.imageUrl)}
                                onError={(e) => {
                                  console.error(`Image failed to load for ${member.name}:`, member.imageUrl);
                                  console.error('Full image URL:', `${API_BASE}${member.imageUrl}`);
                                  console.error('Error details:', e);
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                              style={{ display: member.imageUrl ? 'none' : 'flex' }}
                              id={`fallback-${member.name.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              {member.name.charAt(0)}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-2">{member.name}</h3>
                          <p className="text-secondary font-semibold mb-2">{member.position}</p>
                          <div className="flex flex-col space-y-1 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center justify-center">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {member.experience}
                            </span>
                            <span className="flex items-center justify-center">
                              <Star className="w-3 h-3 mr-1" />
                              {member.specialization}
                            </span>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-primary mb-2 flex items-center text-sm">
                            <Award className="w-3 h-3 text-secondary mr-2" />
                            Key Achievements
                          </h4>
                          {member.achievements && member.achievements.length > 0 ? (
                            <ul className="space-y-1">
                              {member.achievements.slice(0, 2).map((achievement, idx) => (
                                <li key={idx} className="text-xs text-premium flex items-start">
                                  <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                  {achievement}
                                </li>
                              ))}
                              {member.achievements.length > 2 && (
                                <li className="text-xs text-premium italic">
                                  +{member.achievements.length - 2} more achievements
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No achievements listed yet
                            </p>
                          )}
                        </div>

                        {/* Contact Information */}
                        <div className="border-t border-border pt-3">
                          <h4 className="font-semibold text-primary mb-2 flex items-center text-sm">
                            <Users className="w-3 h-3 text-secondary mr-2" />
                            Contact
                          </h4>
                          <div className="space-y-1">
                            <a 
                              href={`mailto:${member.contact.email}`}
                              className="flex items-center text-xs text-premium hover:text-secondary transition-colors"
                            >
                              <Mail className="w-3 h-3 mr-2" />
                              Email
                            </a>
                            <a 
                              href={`tel:${member.contact.phone}`}
                              className="flex items-center text-xs text-premium hover:text-secondary transition-colors"
                            >
                              <Phone className="w-3 h-3 mr-2" />
                              Call
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Carousel Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center space-x-3 mb-16"
        >
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-secondary scale-125' 
                  : 'bg-border hover:bg-secondary/50'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
