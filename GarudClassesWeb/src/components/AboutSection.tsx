import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, Users, BookOpen, Trophy } from "lucide-react";

const AboutSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [counters, setCounters] = useState({
    students: 0,
    successRate: 0,
    mentors: 0,
    years: 0,
  });

  const targetValues = {
    students: 1000,
    successRate: 95,
    mentors: 50,
    years: 15,
  };

  useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;

      const incrementCounters = (step: number) => {
        if (step <= steps) {
          const progress = step / steps;
          setCounters({
            students: Math.floor(targetValues.students * progress),
            successRate: Math.floor(targetValues.successRate * progress),
            mentors: Math.floor(targetValues.mentors * progress),
            years: Math.floor(targetValues.years * progress),
          });
          setTimeout(() => incrementCounters(step + 1), interval);
        }
      };

      incrementCounters(1);
    }
  }, [inView]);

  const stats = [
    {
      icon: Users,
      number: counters.students,
      suffix: "+",
      label: "Students Trained",
      color: "text-blue-500",
    },
    {
      icon: Trophy,
      number: counters.successRate,
      suffix: "%",
      label: "Success Rate",
      color: "text-green-500",
    },
    {
      icon: BookOpen,
      number: counters.mentors,
      suffix: "+",
      label: "Expert Mentors",
      color: "text-purple-500",
    },
    {
      icon: Award,
      number: counters.years,
      suffix: "+",
      label: "Years of Excellence",
      color: "text-orange-500",
    },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold text-lg mb-2 block">About Garud Classes</span>
          <h2 className="heading-section">
            Transforming Dreams into <span className="gradient-text-gold">Reality</span>
          </h2>
          <p className="text-premium text-lg max-w-3xl mx-auto">
            With over 15 years of excellence in JEE and NEET coaching, Garud Classes has been the stepping stone 
            for thousands of students to achieve their engineering and medical dreams.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold text-primary mb-6">Why Choose Garud Classes?</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Expert Faculty</h4>
                  <p className="text-premium">
                    Our experienced educators with proven track records guide students 
                    through comprehensive course modules designed for JEE and NEET success.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Personalized Learning</h4>
                  <p className="text-premium">
                    Small batch sizes ensure individual attention and customized learning 
                    paths tailored to each student's strengths and areas for improvement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Proven Results</h4>
                  <p className="text-premium">
                    Consistent top rankings and selections in JEE Main, JEE Advanced, and NEET 
                    speak volumes about our effective teaching methodology.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="card-premium p-6 text-center group hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 mb-4 ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}{stat.suffix}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="card-premium p-8"
          >
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Award className="w-6 h-6 text-secondary mr-3" />
              Our Mission
            </h3>
            <p className="text-premium leading-relaxed">
              To provide world-class education and guidance that empowers students to excel in 
              competitive exams and build successful careers in engineering and medicine.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="card-premium p-8"
          >
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Trophy className="w-6 h-6 text-secondary mr-3" />
              Our Vision
            </h3>
            <p className="text-premium leading-relaxed">
              To be India's most trusted and innovative coaching institute, known for nurturing 
              talent and creating future leaders in the fields of engineering and medicine.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;