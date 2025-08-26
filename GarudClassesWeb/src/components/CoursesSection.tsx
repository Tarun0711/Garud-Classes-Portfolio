import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  duration: number;
  maxEnrollment?: number;
  price: number;
  thumbnail?: string;
  features?: string[];
  highlight?: string;
  color?: string;
  category: string;
  level: string;
  description: string;
  shortDescription?: string;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
}

const CoursesSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses?isPublished=true&status=published&limit=4');
        if (response.ok) {
          const data = await response.json();
          const publishedCourses = data.data.courses.map((course: any) => ({
            _id: course._id,
            title: course.title,
            subtitle: course.shortDescription || course.description.substring(0, 100) + '...',
            duration: course.duration || 0,
            maxEnrollment: course.maxEnrollment || 30,
            price: course.price || 0,
            thumbnail: course.thumbnail,
            features: [
              course.description.substring(0, 50) + '...',
              'Regular Mock Tests & Analysis',
              'Doubt Clearing Sessions',
              'Previous Year Question Practice',
              'Online Test Series'
            ],
            highlight: course.isFeatured ? 'Featured' : 'Popular',
            color: getColorForCategory(course.category),
            category: course.category,
            level: course.level,
            description: course.description,
            shortDescription: course.shortDescription,
            isPublished: course.isPublished,
            isFeatured: course.isFeatured,
            enrollmentCount: course.enrollmentCount
          }));
          setCourses(publishedCourses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        // Fallback to mock data
        setCourses([
          {
            _id: "1",
            title: "JEE Main + Advanced",
            subtitle: "Complete Engineering Preparation",
            duration: 2,
            maxEnrollment: 30,
            price: 150000,
            thumbnail: undefined,
            features: [
              "Comprehensive Physics, Chemistry & Mathematics",
              "Regular Mock Tests & Analysis",
              "Doubt Clearing Sessions",
              "Previous Year Question Practice",
              "Online Test Series"
            ],
            highlight: "Most Popular",
            color: "from-blue-500 to-purple-600",
            category: "mathematics",
            level: "advanced",
            description: "Complete preparation for JEE Main and Advanced",
            isPublished: true,
            isFeatured: true,
            enrollmentCount: 45
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getColorForCategory = (category: string) => {
    const colors: { [key: string]: string } = {
      'mathematics': 'from-blue-500 to-purple-600',
      'science': 'from-green-500 to-teal-600',
      'language': 'from-orange-500 to-red-600',
      'history': 'from-purple-500 to-pink-600',
      'geography': 'from-indigo-500 to-blue-600',
      'literature': 'from-yellow-500 to-orange-600',
      'computer-science': 'from-cyan-500 to-blue-600',
      'arts': 'from-pink-500 to-purple-600',
      'music': 'from-emerald-500 to-green-600',
      'sports': 'from-red-500 to-pink-600',
      'business': 'from-gray-500 to-slate-600',
      'economics': 'from-amber-500 to-yellow-600',
      'philosophy': 'from-violet-500 to-purple-600',
      'psychology': 'from-rose-500 to-pink-600',
      'other': 'from-slate-500 to-gray-600'
    };
    return colors[category] || 'from-blue-500 to-purple-600';
  };

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-gradient-to-b from-accent to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gradient-to-b from-accent to-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold text-lg mb-2 block">Our Courses</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Choose Your Path to Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive courses designed by expert educators to help you achieve your academic and career goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-8 relative">
                {course.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {course.highlight}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${course.color} rounded-xl flex items-center justify-center text-2xl text-white shadow-lg overflow-hidden`}>
                      {course.thumbnail ? (
                        <img 
                          src={`http://localhost:5000/uploads/images/${course.thumbnail}`} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-1">{course.title}</h3>
                      <p className="text-muted-foreground">{course.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-accent/50 rounded-lg">
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-primary">{course.duration} Years</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-primary">{course.maxEnrollment} Students</div>
                    <div className="text-xs text-muted-foreground">Batch Size</div>
                  </div>
                  <div className="text-center">
                    <GraduationCap className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-primary">₹{(course.price / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">Total Fee</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-primary mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-secondary" />
                    Course Features
                  </h4>
                  <ul className="space-y-2">
                    {course.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">4.9/5</span>
                  </div>
                  
                  <motion.button
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Still confused? Get personalized course recommendation
            </h3>
            <p className="text-muted-foreground mb-6">
              Talk to our counselors and find the perfect course based on your goals and current preparation level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-premium">
                Free Counseling Session
              </button>
              <button className="btn-outline-gold">
                Download Course Brochure
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;