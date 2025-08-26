import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Trophy, Star, Medal, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchToppers, fetchTopperStats, TopperDto } from "../lib/api";

const ResultsSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [toppers, setToppers] = useState<TopperDto[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [toppersData, statsData] = await Promise.all([
          fetchToppers({ featured: true, limit: 8 }),
          fetchTopperStats()
        ]);
        setToppers(toppersData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load toppers data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const achievements = [
    {
      icon: Trophy,
      number: stats?.overall?.top10Ranks ? `${stats.overall.top10Ranks}+` : "15+",
      label: "Top 10 AIR Ranks",
      color: "text-yellow-500"
    },
    {
      icon: Medal,
      number: stats?.overall?.top100Ranks ? `${stats.overall.top100Ranks}+` : "200+",
      label: "Top 100 Selections",
      color: "text-blue-500"
    },
    {
      icon: Star,
      number: "95%",
      label: "Students Qualified",
      color: "text-green-500"
    },
    {
      icon: Award,
      number: stats?.overall?.totalToppers ? `${stats.overall.totalToppers}+` : "500+",
      label: "IIT/NIT Selections",
      color: "text-purple-500"
    }
  ];

  return (
    <section id="results" className="py-20 bg-gradient-to-b from-background to-accent/50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold text-lg mb-2 block">Success Stories</span>
          <h2 className="heading-section">
            Our Students Shine <span className="gradient-text-gold">Brightest</span>
          </h2>
          <p className="text-premium text-lg max-w-3xl mx-auto">
            Witness the remarkable achievements of our students who have secured top ranks 
            in JEE and NEET, making their dreams come true.
          </p>
        </motion.div>

        {/* Achievement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {achievements.map((achievement, index) => (
            <div key={index} className="card-premium p-6 text-center group hover:scale-105">
              <div className={`inline-flex p-3 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 mb-4 ${achievement.color}`}>
                <achievement.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {achievement.number}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {achievement.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-primary mb-12">
            {new Date().getFullYear()} Top Performers
          </h3>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="card-premium p-6 text-center animate-pulse">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {toppers.map((topper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="card-premium p-6 text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-secondary to-secondary-dark text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {topper.rank}
                </div>
                
                {topper.imageUrl ? (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                    <img 
                      src={topper.imageUrl} 
                      alt={topper.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-6xl mb-4">👨‍🎓</div>
                )}
                
                <h4 className="text-xl font-bold text-primary mb-2">{topper.name}</h4>
                <p className="text-secondary font-semibold mb-1">{topper.exam}</p>
                <p className="text-sm text-muted-foreground mb-3">{topper.course}</p>
                
                <div className="bg-accent/50 rounded-lg p-3 mb-4">
                  <div className="text-2xl font-bold text-primary">{topper.score}</div>
                  <div className="text-xs text-muted-foreground">Score Achieved</div>
                </div>
                
                <p className="text-sm text-primary font-medium">
                  {topper.achievement}
                </p>
                
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-primary rounded-xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Join Our Success Story?
            </h3>
            <p className="text-lg mb-6 text-white/90">
              Take the first step towards your dream college and career. 
              Our proven methodology and expert guidance await you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary hover:bg-secondary-dark text-primary font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                Start Your Journey
              </button>
              <button className="border-2 border-white/30 hover:border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-all duration-300">
                View All Results
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsSection;