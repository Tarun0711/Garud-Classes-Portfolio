import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { TeamMemberDto, TopperDto, BlogDto, NotificationDto, NotificationStatsDto } from "../lib/api";

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  status: "active" | "inactive" | "completed";
  joinDate: string;
  progress: number;
}

interface Course {
  id: string;
  name: string;
  instructor: string;
  students: number;
  status: "active" | "draft" | "archived";
  price: number;
}

interface CourseDto {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  category: string;
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  currency: string;
  duration: number; // in hours
  thumbnail?: string;
  tags: string[];
  requirements: string[];
  learningOutcomes: string[];
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  maxEnrollment?: number;
  rating: {
    average: number;
    count: number;
  };
  status: 'draft' | 'published' | 'archived' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };
  imageUrl?: string;
  linkUrl?: string;
  tag?: string;
  isActive: boolean;
  order: number;
}

const AdminDashboard = () => {
  const { logout, username } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBanner, setNewBanner] = useState<Omit<Banner, "_id">>({
    title: "",
    subtitle: "",
    image: {
      filename: "",
      originalName: "",
      mimetype: "",
      size: 0,
      path: ""
    },
    linkUrl: "",
    tag: "",
    isActive: true,
    order: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<CourseDto>>({
    title: "",
    description: "",
    shortDescription: "",
    category: "mathematics",
    level: "beginner",
    price: 0,
    currency: "INR",
    duration: 0,
    tags: [],
    requirements: [],
    learningOutcomes: [],
    isPublished: false,
    isFeatured: false,
    maxEnrollment: 30
  });
  const [selectedCourseImage, setSelectedCourseImage] = useState<File | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ message: "", emoji: "📢", isActive: true, priority: 0, linkUrl: "" });
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDto[]>([]);
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMemberDto>>({
    name: "",
    position: "",
    experience: "",
    specialization: "",
    achievements: [],
    contact: {
      email: "",
      phone: "",
      linkedin: ""
    },
    color: "from-blue-500 to-purple-600",
    isActive: true,
    order: 0
  });
  const [selectedTeamImage, setSelectedTeamImage] = useState<File | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberDto | null>(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [toppers, setToppers] = useState<TopperDto[]>([]);
  const [newTopper, setNewTopper] = useState<Partial<TopperDto>>({
    name: "",
    exam: "",
    rank: "",
    score: "",
    course: "",
    achievement: "",
    year: new Date().getFullYear(),
    category: "JEE Advanced",
    isActive: true,
    order: 0,
    featured: false
  });
  const [selectedTopperImage, setSelectedTopperImage] = useState<File | null>(null);
  const [editingTopper, setEditingTopper] = useState<TopperDto | null>(null);
  const [isEditingTopper, setIsEditingTopper] = useState(false);
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [newBlog, setNewBlog] = useState<Partial<BlogDto>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "JEE Preparation",
    tags: [],
    readTime: 5,
    isPublished: false,
    isFeatured: false,
    metaTitle: "",
    metaDescription: ""
  });
  const [editingBlog, setEditingBlog] = useState<BlogDto | null>(null);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [blogImage, setBlogImage] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStatsDto | null>(null);
  const [newNotification, setNewNotification] = useState<Partial<NotificationDto>>({
    title: "",
    message: "",
    type: "info",
    priority: "normal",
    actionUrl: "",
    expiresAt: ""
  });
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load mock data
    loadMockData();
    loadBanners();
    loadAnnouncements();
    loadCourses();
    loadTeamMembers();
    loadToppers();
    loadBlogs();
    loadNotifications();
    loadNotificationStats();
  }, []);

  const loadMockData = () => {
    setStudents([
      {
        id: "1",
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        course: "JEE Advanced",
        status: "active",
        joinDate: "2024-01-15",
        progress: 75
      },
      {
        id: "2",
        name: "Priya Patel",
        email: "priya.patel@email.com",
        course: "NEET",
        status: "active",
        joinDate: "2024-01-20",
        progress: 60
      },
      {
        id: "3",
        name: "Amit Kumar",
        email: "amit.kumar@email.com",
        course: "JEE Main",
        status: "completed",
        joinDate: "2023-08-10",
        progress: 100
      }
    ]);

    // Mock data will be replaced by API calls
    setCourses([]);
  };



  const loadBanners = async () => {
    try {
      const { fetchAllBanners } = await import("../lib/api");
      const data = await fetchAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };



  // Announcements API
  const loadAnnouncements = async () => {
    try {
      const { fetchAllAnnouncements } = await import("../lib/api");
      const data = await fetchAllAnnouncements();
      setAnnouncements(data);
    } catch {
      // ignore
    }
  };

  const loadCourses = async () => {
    try {
      const { fetchAllCourses } = await import("../lib/api");
      const data = await fetchAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { fetchAllTeamMembers } = await import("../lib/api");
      const data = await fetchAllTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadToppers = async () => {
    try {
      const { fetchAllToppers } = await import("../lib/api");
      const data = await fetchAllToppers();
      setToppers(data);
    } catch (error) {
      console.error('Failed to load toppers:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      const { fetchAllBlogs } = await import("../lib/api");
      const data = await fetchAllBlogs();
      setBlogs(data.blogs);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { fetchAllNotifications } = await import("../lib/api");
      const data = await fetchAllNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const { fetchNotificationStats } = await import("../lib/api");
      const data = await fetchNotificationStats();
      setNotificationStats(data);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title?.trim() || !newCourse.description?.trim()) return;
    try {
      if (isEditingCourse && editingCourse) {
        const { updateCourse } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('title', newCourse.title.trim());
        formData.append('description', newCourse.description.trim());
        formData.append('shortDescription', newCourse.shortDescription?.trim() || '');
        formData.append('category', newCourse.category || 'mathematics');
        formData.append('level', newCourse.level || 'beginner');
        formData.append('price', (newCourse.price || 0).toString());
        formData.append('currency', newCourse.currency || 'INR');
        formData.append('duration', (newCourse.duration || 0).toString());
        formData.append('maxEnrollment', (newCourse.maxEnrollment || 30).toString());
        formData.append('isPublished', (newCourse.isPublished || false).toString());
        formData.append('isFeatured', (newCourse.isFeatured || false).toString());
        
        if (newCourse.tags && newCourse.tags.length > 0) {
          formData.append('tags', JSON.stringify(newCourse.tags));
        }
        if (newCourse.requirements && newCourse.requirements.length > 0) {
          formData.append('requirements', JSON.stringify(newCourse.requirements));
        }
        if (newCourse.learningOutcomes && newCourse.learningOutcomes.length > 0) {
          formData.append('learningOutcomes', JSON.stringify(newCourse.learningOutcomes));
        }
        
        if (selectedCourseImage) {
          formData.append('thumbnail', selectedCourseImage);
        }

        const updated = await updateCourse(editingCourse._id, formData);
        setCourses(courses.map(c => (c._id === editingCourse._id ? updated : c)));
        
        // Reset form
        setIsEditingCourse(false);
        setEditingCourse(null);
        setNewCourse({
          title: "",
          description: "",
          shortDescription: "",
          category: "mathematics",
          level: "beginner",
          price: 0,
          currency: "INR",
          duration: 0,
          tags: [],
          requirements: [],
          learningOutcomes: [],
          isPublished: false,
          isFeatured: false,
          maxEnrollment: 30
        });
        setSelectedCourseImage(null);
      } else {
        const { createCourse } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('title', newCourse.title.trim());
        formData.append('description', newCourse.description.trim());
        formData.append('shortDescription', newCourse.shortDescription?.trim() || '');
        formData.append('category', newCourse.category || 'mathematics');
        formData.append('level', newCourse.level || 'beginner');
        formData.append('price', (newCourse.price || 0).toString());
        formData.append('currency', newCourse.currency || 'INR');
        formData.append('duration', (newCourse.duration || 0).toString());
        formData.append('maxEnrollment', (newCourse.maxEnrollment || 30).toString());
        formData.append('isPublished', (newCourse.isPublished || false).toString());
        formData.append('isFeatured', (newCourse.isFeatured || false).toString());
        
        if (newCourse.tags && newCourse.tags.length > 0) {
          formData.append('tags', JSON.stringify(newCourse.tags));
        }
        if (newCourse.requirements && newCourse.requirements.length > 0) {
          formData.append('requirements', JSON.stringify(newCourse.requirements));
        }
        if (newCourse.learningOutcomes && newCourse.learningOutcomes.length > 0) {
          formData.append('learningOutcomes', JSON.stringify(newCourse.learningOutcomes));
        }
        
        if (selectedCourseImage) {
          formData.append('thumbnail', selectedCourseImage);
        }

        const created = await createCourse(formData);
        setCourses([created, ...courses]);
        setNewCourse({
          title: "",
          description: "",
          shortDescription: "",
          category: "mathematics",
          level: "beginner",
          price: 0,
          currency: "INR",
          duration: 0,
          tags: [],
          requirements: [],
          learningOutcomes: [],
          isPublished: false,
          isFeatured: false,
          maxEnrollment: 30
        });
        setSelectedCourseImage(null);
      }
    } catch (error) {
      console.error('Failed to create/update course:', error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const { deleteCourse } = await import("../lib/api");
      await deleteCourse(id);
      setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleToggleCourseStatus = async (id: string, status: string) => {
    try {
      const { toggleCourseStatus } = await import("../lib/api");
      const updated = await toggleCourseStatus(id, status);
      setCourses(courses.map(c => (c._id === id ? updated : c)));
    } catch (error) {
      console.error('Failed to toggle course status:', error);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.message.trim()) return;
    try {
      const { createAnnouncement } = await import("../lib/api");
      const created = await createAnnouncement({
        message: newAnnouncement.message.trim(),
        emoji: newAnnouncement.emoji.trim(),
        linkUrl: newAnnouncement.linkUrl?.trim() || "",
        isActive: Boolean(newAnnouncement.isActive),
        priority: Number(newAnnouncement.priority) || 0,
      });
      setAnnouncements([created, ...announcements]);
              setNewAnnouncement({ message: "", emoji: "📢", isActive: true, priority: 0, linkUrl: "" });
    } catch (e) {
      // ignore
    }
  };

  const handleToggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      const { updateAnnouncement } = await import("../lib/api");
      const updated = await updateAnnouncement(id, { isActive });
      setAnnouncements(announcements.map(a => (a._id === id ? updated : a)));
    } catch {
      // ignore
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      message: announcement.message,
      emoji: announcement.emoji || "📢",
      isActive: announcement.isActive,
      priority: announcement.priority,
      linkUrl: announcement.linkUrl || ""
    });
    setIsEditing(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return;
    
    try {
      const { updateAnnouncement } = await import("../lib/api");
      const updated = await updateAnnouncement(editingAnnouncement._id, {
        message: newAnnouncement.message.trim(),
        emoji: newAnnouncement.emoji.trim(),
        linkUrl: newAnnouncement.linkUrl?.trim() || "",
        isActive: Boolean(newAnnouncement.isActive),
        priority: Number(newAnnouncement.priority) || 0,
      });
      
      setAnnouncements(announcements.map(a => (a._id === editingAnnouncement._id ? updated : a)));
      setNewAnnouncement({ message: "", emoji: "📢", isActive: true, priority: 0, linkUrl: "" });
      setEditingAnnouncement(null);
      setIsEditing(false);
    } catch (e) {
      // ignore
    }
  };

  const handleCancelEdit = () => {
    setNewAnnouncement({ message: "", emoji: "📢", isActive: true, priority: 0, linkUrl: "" });
    setEditingAnnouncement(null);
    setIsEditing(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { deleteAnnouncement } = await import("../lib/api");
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch {
      // ignore
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title.trim() || !selectedImage) return;
    try {
      const { createBanner } = await import("../lib/api");
      
      const formData = new FormData();
      formData.append('title', newBanner.title.trim());
      formData.append('subtitle', newBanner.subtitle?.trim() || '');
      formData.append('linkUrl', newBanner.linkUrl?.trim() || '');
      formData.append('tag', newBanner.tag?.trim() || '');
      formData.append('isActive', newBanner.isActive.toString());
      formData.append('order', newBanner.order.toString());
      formData.append('file', selectedImage);

      const created = await createBanner(formData);
      setBanners([created, ...banners]);
      setNewBanner({ 
        title: "", 
        subtitle: "", 
        image: { filename: "", originalName: "", mimetype: "", size: 0, path: "" }, 
        linkUrl: "", 
        tag: "", 
        isActive: true, 
        order: 0 
      });
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to create banner:', error);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const { deleteBanner } = await import("../lib/api");
      await deleteBanner(id);
      setBanners(banners.filter(b => b._id !== id));
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleBanner = async (id: string, isActive: boolean) => {
    try {
      const { updateBanner } = await import("../lib/api");
      const updated = await updateBanner(id, { isActive });
      setBanners(banners.map(b => (b._id === id ? updated : b)));
    } catch (error) {
      console.error('Failed to toggle banner:', error);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name?.trim() || !newTeamMember.position?.trim() || !newTeamMember.experience?.trim() || !newTeamMember.specialization?.trim()) return;
    try {
      if (isEditingTeam && editingTeamMember) {
        const { updateTeamMember } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('name', newTeamMember.name.trim());
        formData.append('position', newTeamMember.position.trim());
        formData.append('experience', newTeamMember.experience.trim());
        formData.append('specialization', newTeamMember.specialization.trim());
        formData.append('email', newTeamMember.contact?.email?.trim() || '');
        formData.append('phone', newTeamMember.contact?.phone?.trim() || '');
        formData.append('linkedin', newTeamMember.contact?.linkedin?.trim() || '');
        formData.append('color', newTeamMember.color || 'from-blue-500 to-purple-600');
        formData.append('isActive', (newTeamMember.isActive || false).toString());
        formData.append('order', (newTeamMember.order || 0).toString());
        
        if (newTeamMember.achievements && newTeamMember.achievements.length > 0) {
          formData.append('achievements', JSON.stringify(newTeamMember.achievements));
        }
        
        if (selectedTeamImage) {
          formData.append('file', selectedTeamImage);
        }

        const updated = await updateTeamMember(editingTeamMember._id, formData);
        setTeamMembers(teamMembers.map(t => (t._id === editingTeamMember._id ? updated : t)));
        
        // Reset form
        setIsEditingTeam(false);
        setEditingTeamMember(null);
        setNewTeamMember({
          name: "",
          position: "",
          experience: "",
          specialization: "",
          achievements: [],
          contact: {
            email: "",
            phone: "",
            linkedin: ""
          },
          color: "from-blue-500 to-purple-600",
          isActive: true,
          order: 0
        });
        setSelectedTeamImage(null);
      } else {
        const { createTeamMember } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('name', newTeamMember.name.trim());
        formData.append('position', newTeamMember.position.trim());
        formData.append('experience', newTeamMember.experience.trim());
        formData.append('specialization', newTeamMember.specialization.trim());
        formData.append('email', newTeamMember.contact?.email?.trim() || '');
        formData.append('phone', newTeamMember.contact?.phone?.trim() || '');
        formData.append('linkedin', newTeamMember.contact?.linkedin?.trim() || '');
        formData.append('color', newTeamMember.color || 'from-blue-500 to-purple-600');
        formData.append('isActive', (newTeamMember.isActive || false).toString());
        formData.append('order', (newTeamMember.order || 0).toString());
        
        if (newTeamMember.achievements && newTeamMember.achievements.length > 0) {
          formData.append('achievements', JSON.stringify(newTeamMember.achievements));
        }
        
        if (selectedTeamImage) {
          formData.append('file', selectedTeamImage);
        }

        const created = await createTeamMember(formData);
        setTeamMembers([created, ...teamMembers]);
        setNewTeamMember({
          name: "",
          position: "",
          experience: "",
          specialization: "",
          achievements: [],
          contact: {
            email: "",
            phone: "",
            linkedin: ""
          },
          color: "from-blue-500 to-purple-600",
          isActive: true,
          order: 0
        });
        setSelectedTeamImage(null);
      }
    } catch (error) {
      console.error('Failed to create/update team member:', error);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const { deleteTeamMember } = await import("../lib/api");
      await deleteTeamMember(id);
      setTeamMembers(teamMembers.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete team member:', error);
    }
  };

  const handleToggleTeamMember = async (id: string, isActive: boolean) => {
    try {
      const { toggleTeamMember } = await import("../lib/api");
      const updated = await toggleTeamMember(id, isActive);
      setTeamMembers(teamMembers.map(t => (t._id === id ? updated : t)));
    } catch (error) {
      console.error('Failed to toggle team member status:', error);
    }
  };

  const handleAddTopper = async () => {
    if (!newTopper.name?.trim() || !newTopper.exam?.trim() || !newTopper.rank?.trim() || !newTopper.score?.trim() || !newTopper.course?.trim() || !newTopper.achievement?.trim()) return;
    try {
      if (isEditingTopper && editingTopper) {
        const { updateTopper } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('name', newTopper.name.trim());
        formData.append('exam', newTopper.exam.trim());
        formData.append('rank', newTopper.rank.trim());
        formData.append('score', newTopper.score.trim());
        formData.append('course', newTopper.course.trim());
        formData.append('achievement', newTopper.achievement.trim());
        formData.append('year', (newTopper.year || new Date().getFullYear()).toString());
        formData.append('category', newTopper.category || 'JEE Advanced');
        formData.append('isActive', (newTopper.isActive || false).toString());
        formData.append('order', (newTopper.order || 0).toString());
        formData.append('featured', (newTopper.featured || false).toString());
        
        if (selectedTopperImage) {
          formData.append('file', selectedTopperImage);
        }

        const updated = await updateTopper(editingTopper._id, formData);
        setToppers(toppers.map(t => (t._id === editingTopper._id ? updated : t)));
        
        // Reset form
        setIsEditingTopper(false);
        setEditingTopper(null);
        setNewTopper({
          name: "",
          exam: "",
          rank: "",
          score: "",
          course: "",
          achievement: "",
          year: new Date().getFullYear(),
          category: "JEE Advanced",
          isActive: true,
          order: 0,
          featured: false
        });
        setSelectedTopperImage(null);
      } else {
        const { createTopper } = await import("../lib/api");
        
        const formData = new FormData();
        formData.append('name', newTopper.name.trim());
        formData.append('exam', newTopper.exam.trim());
        formData.append('rank', newTopper.rank.trim());
        formData.append('score', newTopper.score.trim());
        formData.append('course', newTopper.course.trim());
        formData.append('achievement', newTopper.achievement.trim());
        formData.append('year', (newTopper.year || new Date().getFullYear()).toString());
        formData.append('category', newTopper.category || 'JEE Advanced');
        formData.append('isActive', (newTopper.isActive || false).toString());
        formData.append('order', (newTopper.order || 0).toString());
        formData.append('featured', (newTopper.featured || false).toString());
        
        if (selectedTopperImage) {
          formData.append('file', selectedTopperImage);
        }

        const created = await createTopper(formData);
        setToppers([created, ...toppers]);
        setNewTopper({
          name: "",
          exam: "",
          rank: "",
          score: "",
          course: "",
          achievement: "",
          year: new Date().getFullYear(),
          category: "JEE Advanced",
          isActive: true,
          order: 0,
          featured: false
        });
        setSelectedTopperImage(null);
      }
    } catch (error) {
      console.error('Failed to create/update topper:', error);
    }
  };

  const handleDeleteTopper = async (id: string) => {
    try {
      const { deleteTopper } = await import("../lib/api");
      await deleteTopper(id);
      setToppers(toppers.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete topper:', error);
    }
  };

  const handleToggleTopper = async (id: string, isActive: boolean) => {
    try {
      const { toggleTopper } = await import("../lib/api");
      const updated = await toggleTopper(id, isActive);
      setToppers(toppers.map(t => (t._id === id ? updated : t)));
    } catch (error) {
      console.error('Failed to toggle topper status:', error);
    }
  };

  const handleToggleTopperFeatured = async (id: string, featured: boolean) => {
    try {
      const { toggleTopperFeatured } = await import("../lib/api");
      const updated = await toggleTopperFeatured(id, featured);
      setToppers(toppers.map(t => (t._id === id ? updated : t)));
    } catch (error) {
      console.error('Failed to toggle topper featured status:', error);
    }
  };

  const handleAddBlog = async () => {
    if (!newBlog.title?.trim() || !newBlog.excerpt?.trim() || !newBlog.content?.trim()) return;
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', newBlog.title.trim());
      if (newBlog.slug?.trim()) formData.append('slug', newBlog.slug.trim());
      formData.append('excerpt', newBlog.excerpt.trim());
      formData.append('content', newBlog.content.trim());
      formData.append('category', newBlog.category || 'JEE Preparation');
      if (newBlog.tags) formData.append('tags', JSON.stringify(newBlog.tags));
      if (newBlog.readTime) formData.append('readTime', newBlog.readTime.toString());
      if (newBlog.isPublished !== undefined) formData.append('isPublished', newBlog.isPublished.toString());
      if (newBlog.isFeatured !== undefined) formData.append('isFeatured', newBlog.isFeatured.toString());
      if (newBlog.metaTitle?.trim()) formData.append('metaTitle', newBlog.metaTitle.trim());
      if (newBlog.metaDescription?.trim()) formData.append('metaDescription', newBlog.metaDescription.trim());
      
      // Add image if selected
      if (blogImage) {
        formData.append('file', blogImage);
      }

      if (isEditingBlog && editingBlog) {
        const { updateBlog } = await import("../lib/api");
        const updated = await updateBlog(editingBlog._id, formData);
        setBlogs(blogs.map(b => (b._id === editingBlog._id ? updated : b)));
        
        // Reset form
        setIsEditingBlog(false);
        setEditingBlog(null);
        setNewBlog({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "JEE Preparation",
          tags: [],
          readTime: 5,
          isPublished: false,
          isFeatured: false,
          metaTitle: "",
          metaDescription: ""
        });
        setBlogImage(null);
        setBlogImagePreview(null);
      } else {
        const { createBlog } = await import("../lib/api");
        const created = await createBlog(formData);
        setBlogs([created, ...blogs]);
        setNewBlog({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "JEE Preparation",
          tags: [],
          readTime: 5,
          isPublished: false,
          isFeatured: false,
          metaTitle: "",
          metaDescription: ""
        });
        setBlogImage(null);
        setBlogImagePreview(null);
      }
    } catch (error) {
      console.error('Failed to create/update blog:', error);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const { deleteBlog } = await import("../lib/api");
      await deleteBlog(id);
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  const handleToggleBlogPublished = async (id: string) => {
    try {
      const { toggleBlogPublished } = await import("../lib/api");
      const updated = await toggleBlogPublished(id);
      setBlogs(blogs.map(b => (b._id === id ? updated : b)));
    } catch (error) {
      console.error('Failed to toggle blog published status:', error);
    }
  };

  const handleToggleBlogFeatured = async (id: string) => {
    try {
      const { toggleBlogFeatured } = await import("../lib/api");
      const updated = await toggleBlogFeatured(id);
      setBlogs(blogs.map(b => (b._id === id ? updated : b)));
    } catch (error) {
      console.error('Failed to toggle blog featured status:', error);
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title?.trim() || !newNotification.message?.trim()) return;
    try {
      const { createNotification } = await import("../lib/api");
      
      const payload = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        type: newNotification.type || 'info',
        priority: newNotification.priority || 'normal',
        actionUrl: newNotification.actionUrl?.trim() || undefined,
        expiresAt: newNotification.expiresAt || undefined,
        recipient: isBroadcast ? undefined : selectedRecipient || undefined
      };

      const created = await createNotification(payload);
      
      // Reload notifications to get updated list
      await loadNotifications();
      await loadNotificationStats();
      
      // Reset form
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        priority: "normal",
        actionUrl: "",
        expiresAt: ""
      });
      setSelectedRecipient("");
      setIsBroadcast(false);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { deleteNotification } = await import("../lib/api");
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      await loadNotificationStats();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Total Students", value: students.length, icon: Users, color: "text-blue-600" },
    { title: "Active Courses", value: courses.filter(c => c.status === "published").length, icon: BookOpen, color: "text-green-600" },
    { title: "Total Revenue", value: "₹12.5L", icon: BarChart3, color: "text-purple-600" },
    { title: "This Month", value: "₹2.1L", icon: Calendar, color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {username}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          {[ "courses", "hero-banners", "announcements", "team", "toppers", "blogs", "notifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Students</CardTitle>
                  <CardDescription>Latest student registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.course}</p>
                        </div>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>Top performing courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.instructor.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{course.enrollmentCount} students</p>
                          <p className="text-xs text-gray-500">₹{course.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? `Edit Announcement` : `Home Ticker Announcements`}</CardTitle>
                <CardDescription>{isEditing ? `Update announcement details` : `Create and manage top bar announcements`}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ann-emoji">Emoji</Label>
                    <div className="flex gap-2 ">
                      <Input id="ann-emoji" placeholder="📢" value={newAnnouncement.emoji} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, emoji: e.target.value })} />
                      <div className="flex gap-1 w-[1500px] overflow-y-scroll ">
                        {["📢", "📰", "✨", "🎉", "🔥", "💡", "📚", "🎯", "🏆", "⭐"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewAnnouncement({ ...newAnnouncement, emoji })}
                            className="w-8 h-8 text-lg hover:bg-gray-100 rounded border"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="ann-msg">Message</Label>
                    <Input id="ann-msg" placeholder="Type announcement message" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-link">Link (optional)</Label>
                    <Input id="ann-link" placeholder="https://... or /path" value={newAnnouncement.linkUrl} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, linkUrl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-priority">Priority</Label>
                    <Input id="ann-priority" type="number" value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="ann-active" checked={newAnnouncement.isActive} onCheckedChange={(v) => setNewAnnouncement({ ...newAnnouncement, isActive: Boolean(v) })} />
                    <Label htmlFor="ann-active">Active</Label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleUpdateAnnouncement}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Announcement
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddAnnouncement}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Announcement
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Announcements</CardTitle>
                <CardDescription>Toggle active status or remove</CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="text-sm text-gray-600">No announcements yet. Create one above.</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a) => (
                      <div key={a._id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{a.emoji} {a.message}</p>
                          {a.linkUrl ? <a href={a.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate">{a.linkUrl}</a> : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch checked={Boolean(a.isActive)} onCheckedChange={(v) => handleToggleAnnouncement(a._id, Boolean(v))} id={`ann-${a._id}`} />
                            <Label htmlFor={`ann-${a._id}`}>Active</Label>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(a)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(a._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students Management</CardTitle>
                    <CardDescription>Manage all registered students</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{student.course}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(student.joinDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Course Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{isEditingCourse ? 'Edit Course' : 'Create New Course'}</CardTitle>
                <CardDescription>{isEditingCourse ? 'Update course details' : 'Add a new course to the system'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title *</Label>
                    <Input
                      id="course-title"
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-category">Category *</Label>
                    <select
                      id="course-category"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Neet">Neet</option>
                      <option value="Jee">Jee</option>
                      <option value="Jee-Mains">Jee Mains</option>
                      <option value="Jee-Advanced">Jee Advanced</option>
                      <option value="dropper">Dropper</option>
                      <option value="Foundation">Foundation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-level">Level *</Label>
                    <select
                      id="course-level"
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-price">Price (₹) *</Label>
                    <Input
                      id="course-price"
                      type="number"
                      placeholder="0"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-duration">Duration (years) *</Label>
                    <Input
                      id="course-duration"
                      type="number"
                      placeholder="0"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-max-enrollment">Max Enrollment</Label>
                    <Input
                      id="course-max-enrollment"
                      type="number"
                      placeholder="30"
                      value={newCourse.maxEnrollment}
                      onChange={(e) => setNewCourse({ ...newCourse, maxEnrollment: Number(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="course-description">Description *</Label>
                    <Textarea
                      id="course-description"
                      placeholder="Enter course description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="course-short-description">Short Description</Label>
                    <Input
                      id="course-short-description"
                      placeholder="Brief course summary"
                      value={newCourse.shortDescription}
                      onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="course-image">Course Image</Label>
                    <Input
                      id="course-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCourseImage(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {selectedCourseImage && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedCourseImage.name} ({(selectedCourseImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="course-published"
                      checked={newCourse.isPublished || false}
                      onCheckedChange={(v) => setNewCourse({ ...newCourse, isPublished: Boolean(v) })}
                    />
                    <Label htmlFor="course-published">Published</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="course-featured"
                      checked={newCourse.isFeatured || false}
                      onCheckedChange={(v) => setNewCourse({ ...newCourse, isFeatured: Boolean(v) })}
                    />
                    <Label htmlFor="course-featured">Featured</Label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingCourse ? (
                    <>
                      <Button onClick={handleAddCourse}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Course
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditingCourse(false);
                        setEditingCourse(null);
                        setNewCourse({
                          title: "",
                          description: "",
                          shortDescription: "",
                          category: "mathematics",
                          level: "beginner",
                          price: 0,
                          currency: "INR",
                          duration: 0,
                          tags: [],
                          requirements: [],
                          learningOutcomes: [],
                          isPublished: false,
                          isFeatured: false,
                          maxEnrollment: 30
                        });
                        setSelectedCourseImage(null);
                      }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddCourse}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Courses</CardTitle>
                    <CardDescription>Manage all available courses</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-600">No courses yet. Create one above.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(course.status)}>
                              {course.status}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingCourse(course);
                                setNewCourse({
                                  title: course.title,
                                  description: course.description,
                                  shortDescription: course.shortDescription || "",
                                  category: course.category,
                                  level: course.level,
                                  price: course.price,
                                  currency: course.currency,
                                  duration: course.duration,
                                  tags: course.tags,
                                  requirements: course.requirements,
                                  learningOutcomes: course.learningOutcomes,
                                  isPublished: course.isPublished,
                                  isFeatured: course.isFeatured,
                                  maxEnrollment: course.maxEnrollment || 30
                                });
                                setIsEditingCourse(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>Instructor: {course.instructor.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {course.thumbnail && (
                              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={`/uploads/images/${course.thumbnail}`} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Students:</span>
                              <span className="font-medium">{course.enrollmentCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium">₹{course.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="text-gray-600">{course.duration} hours</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Level:</span>
                              <span className="font-medium capitalize">{course.level}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <select
                                value={course.status}
                                onChange={(e) => handleToggleCourseStatus(course._id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Growth</CardTitle>
                  <CardDescription>Monthly student registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-gray-600">Student Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-gray-600">Course Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hero Banners Tab */}
        {activeTab === "hero-banners" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Banners</CardTitle>
                <CardDescription>Create and manage banners shown in the hero section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-title">Title</Label>
                    <Input
                      id="banner-title"
                      placeholder="Enter banner title"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-subtitle">Subtitle (optional)</Label>
                    <Textarea
                      id="banner-subtitle"
                      placeholder="Short subtitle"
                      value={newBanner.subtitle}
                      onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                      className="min-h-[42px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-tag">Tag (optional)</Label>
                    <Input
                      id="banner-tag"
                      placeholder="e.g., featured, new, special"
                      value={newBanner.tag}
                      onChange={(e) => setNewBanner({ ...newBanner, tag: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="banner-image">Banner Image</Label>
                    <Input
                      id="banner-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {selectedImage && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-link">Link URL (optional)</Label>
                    <Input
                      id="banner-link"
                      placeholder="https://... or /courses"
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-order">Order</Label>
                    <Input
                      id="banner-order"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newBanner.order}
                      onChange={(e) => setNewBanner({ ...newBanner, order: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="banner-active"
                      checked={newBanner.isActive}
                      onCheckedChange={(v) => setNewBanner({ ...newBanner, isActive: Boolean(v) })}
                    />
                    <Label htmlFor="banner-active">Active</Label>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleAddBanner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Banners</CardTitle>
                <CardDescription>Toggle active status or remove banners</CardDescription>
              </CardHeader>
              <CardContent>
                {banners.length === 0 ? (
                  <p className="text-sm text-gray-600">No banners yet. Create one above.</p>
                ) : (
                  <div className="space-y-4">
                    {banners.map((b) => (
                      <div key={b._id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                          {b.image ? (
                            <img src={`/uploads/images/${b.image.filename}`} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{b.title}</p>
                          {b.subtitle ? (
                            <p className="text-sm text-gray-600 truncate">{b.subtitle}</p>
                          ) : null}
                          {b.tag && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {b.tag}
                            </Badge>
                          )}
                          {b.linkUrl ? (
                            <a href={b.linkUrl} className="text-xs text-blue-600 hover:underline truncate" target="_blank" rel="noreferrer">
                              {b.linkUrl}
                            </a>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch checked={b.isActive} onCheckedChange={(v) => handleToggleBanner(b._id, Boolean(v))} id={`toggle-${b._id}`} />
                            <Label htmlFor={`toggle-${b._id}`}>Active</Label>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBanner(b._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Team Member Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{isEditingTeam ? 'Edit Team Member' : 'Add New Team Member'}</CardTitle>
                <CardDescription>{isEditingTeam ? 'Update team member details' : 'Add a new team member to the system'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Name *</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team member name"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-position">Position *</Label>
                    <Input
                      id="team-position"
                      placeholder="e.g., Director & Chief Mentor"
                      value={newTeamMember.position}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-experience">Experience *</Label>
                    <Input
                      id="team-experience"
                      placeholder="e.g., 20+ Years"
                      value={newTeamMember.experience}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, experience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-specialization">Specialization *</Label>
                    <Input
                      id="team-specialization"
                      placeholder="e.g., JEE Advanced Expert"
                      value={newTeamMember.specialization}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, specialization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-email">Email *</Label>
                    <Input
                      id="team-email"
                      type="email"
                      placeholder="team@garudclasses.com"
                      value={newTeamMember.contact?.email}
                      onChange={(e) => setNewTeamMember({ 
                        ...newTeamMember, 
                        contact: { ...newTeamMember.contact, email: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-phone">Phone *</Label>
                    <Input
                      id="team-phone"
                      placeholder="+91 98765 43210"
                      value={newTeamMember.contact?.phone}
                      onChange={(e) => setNewTeamMember({ 
                        ...newTeamMember, 
                        contact: { ...newTeamMember.contact, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-linkedin">LinkedIn (optional)</Label>
                    <Input
                      id="team-linkedin"
                      placeholder="linkedin.com/in/username"
                      value={newTeamMember.contact?.linkedin}
                      onChange={(e) => setNewTeamMember({ 
                        ...newTeamMember, 
                        contact: { ...newTeamMember.contact, linkedin: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-color">Color Theme</Label>
                    <select
                      id="team-color"
                      value={newTeamMember.color}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="from-blue-500 to-purple-600">Blue to Purple</option>
                      <option value="from-green-500 to-teal-600">Green to Teal</option>
                      <option value="from-orange-500 to-red-600">Orange to Red</option>
                      <option value="from-purple-500 to-pink-600">Purple to Pink</option>
                      <option value="from-indigo-500 to-blue-600">Indigo to Blue</option>
                      <option value="from-emerald-500 to-green-600">Emerald to Green</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-order">Order</Label>
                    <Input
                      id="team-order"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newTeamMember.order}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, order: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="team-image">Profile Image *</Label>
                    <Input
                      id="team-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedTeamImage(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {selectedTeamImage && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedTeamImage.name} ({(selectedTeamImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Key Achievements</Label>
                    <div className="space-y-2">
                      {newTeamMember.achievements?.map((achievement, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Enter achievement (e.g., PhD in Physics)"
                            value={achievement}
                            onChange={(e) => {
                              const updatedAchievements = [...(newTeamMember.achievements || [])];
                              updatedAchievements[index] = e.target.value;
                              setNewTeamMember({ ...newTeamMember, achievements: updatedAchievements });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedAchievements = newTeamMember.achievements?.filter((_, i) => i !== index) || [];
                              setNewTeamMember({ ...newTeamMember, achievements: updatedAchievements });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedAchievements = [...(newTeamMember.achievements || []), ""];
                          setNewTeamMember({ ...newTeamMember, achievements: updatedAchievements });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="team-active"
                      checked={newTeamMember.isActive || false}
                      onCheckedChange={(v) => setNewTeamMember({ ...newTeamMember, isActive: Boolean(v) })}
                    />
                    <Label htmlFor="team-active">Active</Label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingTeam ? (
                    <>
                      <Button onClick={handleAddTeamMember}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Team Member
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditingTeam(false);
                        setEditingTeamMember(null);
                        setNewTeamMember({
                          name: "",
                          position: "",
                          experience: "",
                          specialization: "",
                          achievements: [],
                          contact: {
                            email: "",
                            phone: "",
                            linkedin: ""
                          },
                          color: "from-blue-500 to-purple-600",
                          isActive: true,
                          order: 0
                        });
                        setSelectedTeamImage(null);
                      }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddTeamMember}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Team Members</CardTitle>
                    <CardDescription>Manage all team members</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-gray-600">No team members yet. Add one above.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers
                      .filter(member => 
                        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.specialization.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((member) => (
                      <Card key={member._id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(member.isActive ? 'active' : 'inactive')}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingTeamMember(member);
                                setNewTeamMember({
                                  name: member.name,
                                  position: member.position,
                                  experience: member.experience,
                                  specialization: member.specialization,
                                  achievements: member.achievements,
                                  contact: member.contact,
                                  color: member.color,
                                  isActive: member.isActive,
                                  order: member.order
                                });
                                setIsEditingTeam(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTeamMember(member._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.position}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {member.imageUrl && (
                              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={member.imageUrl} 
                                  alt={member.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Experience:</span>
                              <span className="font-medium">{member.experience}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Specialization:</span>
                              <span className="font-medium">{member.specialization}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium truncate">{member.contact.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{member.contact.phone}</span>
                            </div>
                            {member.achievements && member.achievements.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-sm text-gray-600">Achievements:</span>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {member.achievements.slice(0, 3).map((achievement, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                      <span className="truncate">{achievement}</span>
                                    </li>
                                  ))}
                                  {member.achievements.length > 3 && (
                                    <li className="text-xs text-gray-500 italic">
                                      +{member.achievements.length - 3} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <select
                                value={member.isActive ? 'active' : 'inactive'}
                                onChange={(e) => handleToggleTeamMember(member._id, e.target.value === 'active')}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Toppers Tab */}
        {activeTab === "toppers" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Topper Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{isEditingTopper ? 'Edit Topper' : 'Add New Topper'}</CardTitle>
                <CardDescription>{isEditingTopper ? 'Update topper details' : 'Add a new topper to showcase student achievements'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topper-name">Student Name *</Label>
                    <Input
                      id="topper-name"
                      placeholder="Enter student name"
                      value={newTopper.name}
                      onChange={(e) => setNewTopper({ ...newTopper, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-exam">Exam *</Label>
                    <Input
                      id="topper-exam"
                      placeholder="e.g., JEE Advanced 2024"
                      value={newTopper.exam}
                      onChange={(e) => setNewTopper({ ...newTopper, exam: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-rank">Rank *</Label>
                    <Input
                      id="topper-rank"
                      placeholder="e.g., AIR 1"
                      value={newTopper.rank}
                      onChange={(e) => setNewTopper({ ...newTopper, rank: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-score">Score *</Label>
                    <Input
                      id="topper-score"
                      placeholder="e.g., 354/360"
                      value={newTopper.score}
                      onChange={(e) => setNewTopper({ ...newTopper, score: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-course">Course *</Label>
                    <Input
                      id="topper-course"
                      placeholder="e.g., 2-Year JEE Program"
                      value={newTopper.course}
                      onChange={(e) => setNewTopper({ ...newTopper, course: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-achievement">Achievement *</Label>
                    <Input
                      id="topper-achievement"
                      placeholder="e.g., IIT Bombay - Computer Science"
                      value={newTopper.achievement}
                      onChange={(e) => setNewTopper({ ...newTopper, achievement: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-year">Year *</Label>
                    <Input
                      id="topper-year"
                      type="number"
                      min="2000"
                      max="2030"
                      placeholder="2024"
                      value={newTopper.year}
                      onChange={(e) => setNewTopper({ ...newTopper, year: Number(e.target.value) || new Date().getFullYear() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-category">Category *</Label>
                    <select
                      id="topper-category"
                      value={newTopper.category}
                      onChange={(e) => setNewTopper({ ...newTopper, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="JEE Advanced">JEE Advanced</option>
                      <option value="JEE Main">JEE Main</option>
                      <option value="NEET">NEET</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topper-order">Order</Label>
                    <Input
                      id="topper-order"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newTopper.order}
                      onChange={(e) => setNewTopper({ ...newTopper, order: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="topper-image">Student Image *</Label>
                    <Input
                      id="topper-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedTopperImage(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {selectedTopperImage && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedTopperImage.name} ({(selectedTopperImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="topper-active"
                      checked={newTopper.isActive || false}
                      onCheckedChange={(v) => setNewTopper({ ...newTopper, isActive: Boolean(v) })}
                    />
                    <Label htmlFor="topper-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="topper-featured"
                      checked={newTopper.featured || false}
                      onCheckedChange={(v) => setNewTopper({ ...newTopper, featured: Boolean(v) })}
                    />
                    <Label htmlFor="topper-featured">Featured</Label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingTopper ? (
                    <>
                      <Button onClick={handleAddTopper}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Topper
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditingTopper(false);
                        setEditingTopper(null);
                        setNewTopper({
                          name: "",
                          exam: "",
                          rank: "",
                          score: "",
                          course: "",
                          achievement: "",
                          year: new Date().getFullYear(),
                          category: "JEE Advanced",
                          isActive: true,
                          order: 0,
                          featured: false
                        });
                        setSelectedTopperImage(null);
                      }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddTopper}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Topper
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Toppers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Toppers</CardTitle>
                    <CardDescription>Manage all student achievements</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search toppers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {toppers.length === 0 ? (
                  <p className="text-sm text-gray-600">No toppers yet. Add one above.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toppers
                      .filter(topper => 
                        topper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        topper.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        topper.category.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((topper) => (
                      <Card key={topper._id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(topper.isActive ? 'active' : 'inactive')}>
                              {topper.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {topper.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Featured
                              </Badge>
                            )}
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingTopper(topper);
                                setNewTopper({
                                  name: topper.name,
                                  exam: topper.exam,
                                  rank: topper.rank,
                                  score: topper.score,
                                  course: topper.course,
                                  achievement: topper.achievement,
                                  year: topper.year,
                                  category: topper.category,
                                  isActive: topper.isActive,
                                  order: topper.order,
                                  featured: topper.featured
                                });
                                setIsEditingTopper(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTopper(topper._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{topper.name}</CardTitle>
                          <CardDescription>{topper.exam}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {topper.imageUrl && (
                              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={topper.imageUrl} 
                                  alt={topper.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rank:</span>
                              <span className="font-medium">{topper.rank}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Score:</span>
                              <span className="font-medium">{topper.score}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Course:</span>
                              <span className="font-medium">{topper.course}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Year:</span>
                              <span className="font-medium">{topper.year}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium">{topper.category}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Achievement:</span>
                              <p className="font-medium mt-1">{topper.achievement}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <select
                                value={topper.isActive ? 'active' : 'inactive'}
                                onChange={(e) => handleToggleTopper(topper._id, e.target.value === 'active')}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Featured:</span>
                              <select
                                value={topper.featured ? 'featured' : 'not-featured'}
                                onChange={(e) => handleToggleTopperFeatured(topper._id, e.target.value === 'featured')}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="featured">Featured</option>
                                <option value="not-featured">Not Featured</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Blog Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{isEditingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
                <CardDescription>{isEditingBlog ? 'Update blog post details' : 'Add a new blog post to the system'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Blog Title *</Label>
                    <Input
                      id="blog-title"
                      placeholder="Enter blog title"
                      value={newBlog.title}
                      onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-slug">Slug (optional)</Label>
                    <Input
                      id="blog-slug"
                      placeholder="auto-generated from title"
                      value={newBlog.slug}
                      onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-category">Category *</Label>
                    <select
                      id="blog-category"
                      value={newBlog.category}
                      onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="JEE Preparation">JEE Preparation</option>
                      <option value="NEET Preparation">NEET Preparation</option>
                      <option value="Study Material">Study Material</option>
                      <option value="Test Strategy">Test Strategy</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Exam Strategy">Exam Strategy</option>
                      <option value="Success Stories">Success Stories</option>
                      <option value="Tips & Tricks">Tips & Tricks</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-read-time">Read Time (minutes) *</Label>
                    <Input
                      id="blog-read-time"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="5"
                      value={newBlog.readTime}
                      onChange={(e) => setNewBlog({ ...newBlog, readTime: Number(e.target.value) || 5 })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="blog-image">Featured Image</Label>
                    <div className="space-y-4">
                      {blogImagePreview && (
                        <div className="relative">
                          <img
                            src={blogImagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setBlogImage(null);
                              setBlogImagePreview(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <Input
                          id="blog-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBlogImage(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setBlogImagePreview(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1"
                        />
                        {blogImage && (
                          <span className="text-sm text-green-600">
                            ✓ {blogImage.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload a featured image for the blog post (optional). Recommended size: 1200x630px.
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="blog-excerpt">Excerpt *</Label>
                    <Textarea
                      id="blog-excerpt"
                      placeholder="Brief summary of the blog post"
                      value={newBlog.excerpt}
                      onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="blog-content">Content *</Label>
                    <Textarea
                      id="blog-content"
                      placeholder="Full blog content (supports HTML)"
                      value={newBlog.content}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      {newBlog.tags?.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Enter tag"
                            value={tag}
                            onChange={(e) => {
                              const updatedTags = [...(newBlog.tags || [])];
                              updatedTags[index] = e.target.value;
                              setNewBlog({ ...newBlog, tags: updatedTags });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedTags = newBlog.tags?.filter((_, i) => i !== index) || [];
                              setNewBlog({ ...newBlog, tags: updatedTags });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedTags = [...(newBlog.tags || []), ""];
                          setNewBlog({ ...newBlog, tags: updatedTags });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-meta-title">Meta Title (SEO)</Label>
                    <Input
                      id="blog-meta-title"
                      placeholder="SEO title for search engines"
                      value={newBlog.metaTitle}
                      onChange={(e) => setNewBlog({ ...newBlog, metaTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-meta-description">Meta Description (SEO)</Label>
                    <Input
                      id="blog-meta-description"
                      placeholder="SEO description for search engines"
                      value={newBlog.metaDescription}
                      onChange={(e) => setNewBlog({ ...newBlog, metaDescription: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-published"
                      checked={newBlog.isPublished || false}
                      onCheckedChange={(v) => setNewBlog({ ...newBlog, isPublished: Boolean(v) })}
                    />
                    <Label htmlFor="blog-published">Published</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-featured"
                      checked={newBlog.isFeatured || false}
                      onCheckedChange={(v) => setNewBlog({ ...newBlog, isFeatured: Boolean(v) })}
                    />
                    <Label htmlFor="blog-featured">Featured</Label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingBlog ? (
                    <>
                      <Button onClick={handleAddBlog}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Blog Post
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditingBlog(false);
                        setEditingBlog(null);
                        setNewBlog({
                          title: "",
                          slug: "",
                          excerpt: "",
                          content: "",
                          category: "JEE Preparation",
                          tags: [],
                          readTime: 5,
                          isPublished: false,
                          isFeatured: false,
                          metaTitle: "",
                          metaDescription: ""
                        });
                        setBlogImage(null);
                        setBlogImagePreview(null);
                      }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddBlog}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Blog Post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Blogs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Blog Posts</CardTitle>
                    <CardDescription>Manage all blog posts</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {blogs.length === 0 ? (
                  <p className="text-sm text-gray-600">No blog posts yet. Create one above.</p>
                ) : (
                  <div className="space-y-4">
                    {blogs
                      .filter(blog => 
                        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        blog.author.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((blog) => (
                                             <div key={blog._id} className="flex items-center gap-4 p-4 border rounded-lg">
                         <div className="flex-shrink-0">
                           {blog.imageUrl ? (
                             <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                               <img 
                                 src={blog.imageUrl} 
                                 alt={blog.title} 
                                 className="w-full h-full object-cover"
                               />
                             </div>
                           ) : (
                             <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                               📚
                             </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-2">
                             <h3 className="font-medium truncate">{blog.title}</h3>
                             <Badge className={getStatusColor(blog.isPublished ? 'active' : 'inactive')}>
                               {blog.isPublished ? 'Published' : 'Draft'}
                             </Badge>
                             {blog.isFeatured && (
                               <Badge className="bg-yellow-100 text-yellow-800">
                                 Featured
                               </Badge>
                             )}
                           </div>
                          <p className="text-sm text-gray-600 truncate mb-2">{blog.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By: {blog.author.name}</span>
                            <span>Category: {blog.category}</span>
                            <span>{blog.readTime} min read</span>
                            <span>{blog.viewCount} views</span>
                            {blog.publishedAt && (
                              <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={blog.isPublished} 
                              onCheckedChange={() => handleToggleBlogPublished(blog._id)} 
                              id={`blog-published-${blog._id}`} 
                            />
                            <Label htmlFor={`blog-published-${blog._id}`}>Published</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={blog.isFeatured} 
                              onCheckedChange={() => handleToggleBlogFeatured(blog._id)} 
                              id={`blog-featured-${blog._id}`} 
                            />
                            <Label htmlFor={`blog-featured-${blog._id}`}>Featured</Label>
                          </div>
                                                     <Button variant="ghost" size="sm" onClick={() => {
                             setEditingBlog(blog);
                             setNewBlog({
                               title: blog.title,
                               slug: blog.slug,
                               excerpt: blog.excerpt,
                               content: blog.content,
                               category: blog.category,
                               tags: blog.tags,
                               readTime: blog.readTime,
                               isPublished: blog.isPublished,
                               isFeatured: blog.isFeatured,
                               metaTitle: blog.metaTitle || "",
                               metaDescription: blog.metaDescription || ""
                             });
                             // Set existing image preview if available
                             if (blog.imageUrl) {
                               setBlogImagePreview(blog.imageUrl);
                             } else {
                               setBlogImagePreview(null);
                             }
                             setBlogImage(null); // Don't set the file, just show preview
                             setIsEditingBlog(true);
                           }}>
                             <Edit className="w-4 h-4" />
                           </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBlog(blog._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Notification Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>Create and send notifications to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-title">Title *</Label>
                    <Input
                      id="notification-title"
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-type">Type</Label>
                    <select
                      id="notification-type"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-priority">Priority</Label>
                    <select
                      id="notification-priority"
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-action-url">Action URL (optional)</Label>
                    <Input
                      id="notification-action-url"
                      placeholder="https://... or /path"
                      value={newNotification.actionUrl}
                      onChange={(e) => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-expires">Expires At (optional)</Label>
                    <Input
                      id="notification-expires"
                      type="datetime-local"
                      value={newNotification.expiresAt}
                      onChange={(e) => setNewNotification({ ...newNotification, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-recipient">Recipient</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="broadcast"
                          checked={isBroadcast}
                          onChange={() => setIsBroadcast(true)}
                          className="text-primary"
                        />
                        <Label htmlFor="broadcast">Send to all students</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="specific"
                          checked={!isBroadcast}
                          onChange={() => setIsBroadcast(false)}
                          className="text-primary"
                        />
                        <Label htmlFor="specific">Send to specific user</Label>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notification-message">Message *</Label>
                    <Textarea
                      id="notification-message"
                      placeholder="Enter notification message"
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleCreateNotification}>
                    <Plus className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Statistics */}
            {notificationStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Statistics</CardTitle>
                  <CardDescription>Overview of notification activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{notificationStats.total}</div>
                      <div className="text-sm text-gray-600">Total Notifications</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{notificationStats.unread}</div>
                      <div className="text-sm text-gray-600">Unread</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{notificationStats.today}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {notificationStats.total > 0 ? Math.round((notificationStats.total - notificationStats.unread) / notificationStats.total * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Read Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>Manage all sent notifications</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-600">No notifications yet. Send one above.</p>
                ) : (
                  <div className="space-y-4">
                    {notifications
                      .filter(notification => 
                        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((notification) => (
                      <div key={notification._id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium truncate">{notification.title}</h3>
                            <Badge className={getStatusColor(notification.isRead ? 'active' : 'inactive')}>
                              {notification.isRead ? 'Read' : 'Unread'}
                            </Badge>
                            <Badge className={`bg-${notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'orange' : notification.type === 'error' ? 'red' : notification.type === 'announcement' ? 'purple' : 'blue'}-100 text-${notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'orange' : notification.type === 'error' ? 'red' : notification.type === 'announcement' ? 'purple' : 'blue'}-800`}>
                              {notification.type}
                            </Badge>
                            <Badge className={`bg-${notification.priority === 'urgent' ? 'red' : notification.priority === 'high' ? 'orange' : notification.priority === 'low' ? 'gray' : 'blue'}-100 text-${notification.priority === 'urgent' ? 'red' : notification.priority === 'high' ? 'orange' : notification.priority === 'low' ? 'gray' : 'blue'}-800`}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>To: {notification.recipient.name}</span>
                            <span>From: {notification.sender.name}</span>
                            <span>{notification.timeAgo || 'Just now'}</span>
                            {notification.actionUrl && (
                              <a href={notification.actionUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                View Action →
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
