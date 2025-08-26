import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  User, 
  ArrowRight, 
  BookOpen, 
  Tag,
  Clock,
  Search,
  TrendingUp
} from "lucide-react";
import TopInfoBar from "@/components/TopInfoBar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchBlogs, fetchFeaturedBlogs, fetchBlogCategories, BlogDto } from "@/lib/api";

const Blog = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        const [blogsData, featuredData, categoriesData] = await Promise.all([
          fetchBlogs({ limit: 20 }),
          fetchFeaturedBlogs(),
          fetchBlogCategories()
        ]);
        
        setBlogs(blogsData.blogs);
        setFeaturedBlogs(featuredData);
        setCategories(["All Posts", ...categoriesData]);
      } catch (error) {
        console.error('Failed to load blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  const featuredPost = featuredBlogs[0];
  const regularPosts = blogs.filter(blog => !blog.isFeatured);

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
              Educational <span className="gradient-text-gold">Blog</span>
            </h1>
            <p className="text-premium text-lg max-w-3xl mx-auto">
              Stay updated with the latest tips, strategies, and insights to excel in your JEE and NEET preparation.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-secondary text-primary shadow-md" 
                    : "bg-white hover:bg-secondary/10 text-muted-foreground hover:text-primary border border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-semibold">Featured Article</span>
              </div>
              
              <div className="card-premium p-8 lg:p-12 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-5xl">📚</span>
                      <div>
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                          {featuredPost.category}
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4 leading-tight">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-premium text-lg mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString() : 'Draft'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPost.readTime} min read</span>
                      </div>
                    </div>
                    
                    <Link to={`/blog/${featuredPost.slug}`} className="btn-premium group">
                      Read More
                    </Link>
                  </div>
                  
                                     <div className="relative">
                     {featuredPost.imageUrl ? (
                       <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden">
                         <img 
                           src={`https://garud-classes-portfolio.onrender.com${featuredPost.imageUrl}`} 
                           alt={featuredPost.title} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                     ) : (
                       <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-8xl">
                         📚
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12 bg-gradient-to-b from-background to-accent/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-primary mb-12 text-center"
          >
            Latest Articles
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts
              .filter(post => 
                selectedCategory === "All Posts" || post.category === selectedCategory
              )
              .filter(post =>
                searchTerm === "" || 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-course group cursor-pointer"
              >
                                 <Link to={`/blog/${post.slug}`}>
                   <div className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       {post.imageUrl ? (
                         <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                           <img 
                             src={post.imageUrl} 
                             alt={post.title} 
                             className="w-full h-full object-cover"
                           />
                         </div>
                       ) : (
                         <span className="text-4xl">📚</span>
                       )}
                       <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                         {post.category}
                       </span>
                     </div>
                    
                    <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="bg-accent text-primary px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <span className="text-secondary hover:text-secondary-dark font-medium text-sm flex items-center space-x-1 group">
                        <span>Read More</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
          
          {/* Load More Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <button className="btn-outline-gold">
              Load More Articles
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;