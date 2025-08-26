import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Clock,
  Tag,
  Eye,
  Share2,
  BookOpen,
  TrendingUp
} from "lucide-react";
import TopInfoBar from "@/components/TopInfoBar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchBlogBySlug, fetchFeaturedBlogs, BlogDto } from "@/lib/api";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogDto | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    const loadBlog = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [blogData, featuredData] = await Promise.all([
          fetchBlogBySlug(slug),
          fetchFeaturedBlogs()
        ]);
        
        setBlog(blogData);
        setRelatedBlogs(featuredData.filter(b => b._id !== blogData._id).slice(0, 3));
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError('Blog post not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopInfoBar />
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen">
        <TopInfoBar />
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
            <Link to="/blog" className="btn-premium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-primary">{blog.title}</span>
            </div>

            {/* Blog Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                  {blog.category}
                </span>
                {blog.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-6 leading-tight">
                {blog.title}
              </h1>
              
              <p className="text-premium text-xl mb-8 leading-relaxed">
                {blog.excerpt}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{blog.author.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Draft'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{blog.readTime} min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{blog.viewCount} views</span>
                </div>
              </div>
            </div>

                         {/* Featured Image */}
             {blog.imageUrl && (
               <div className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden mb-8 shadow-lg">
                 <img 
                   src={`http://localhost:5000${blog.imageUrl}`} 
                   alt={blog.title} 
                   className="w-full h-full object-cover"
                 />
               </div>
             )}

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-premium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-accent text-primary px-3 py-1 rounded-full text-sm hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-muted-foreground">Share this post:</span>
                  <button className="p-2 hover:bg-accent rounded-full transition-colors">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Link to="/blog" className="btn-outline-gold">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-background to-accent/30">
          <div className="container mx-auto px-4">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                Related Articles
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.article
                    key={relatedBlog._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card-course group cursor-pointer"
                  >
                                         <Link to={`/blog/${relatedBlog.slug}`}>
                       <div className="p-6">
                         <div className="flex items-center justify-between mb-4">
                           {relatedBlog.imageUrl ? (
                             <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                               <img 
                                 src={relatedBlog.imageUrl} 
                                 alt={relatedBlog.title} 
                                 className="w-full h-full object-cover"
                               />
                             </div>
                           ) : (
                             <span className="text-4xl">📚</span>
                           )}
                           <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                             {relatedBlog.category}
                           </span>
                         </div>
                        
                        <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors leading-tight">
                          {relatedBlog.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                          {relatedBlog.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{relatedBlog.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{relatedBlog.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {relatedBlog.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="bg-accent text-primary px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <span className="text-secondary hover:text-secondary-dark font-medium text-sm flex items-center space-x-1 group">
                            <span>Read More</span>
                            <BookOpen className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
