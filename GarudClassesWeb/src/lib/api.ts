export interface AnnouncementDto {
  _id: string;
  message: string;
  emoji?: string;
  linkUrl?: string;
  isActive: boolean;
  priority: number;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerDto {
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
  imageUrl?: string; // For frontend display
  linkUrl?: string;
  tag?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDto {
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

export interface TeamMemberDto {
  _id: string;
  name: string;
  position: string;
  experience: string;
  specialization: string;
  image: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };
  imageUrl?: string; 
  achievements: string[];
  contact: {
    email: string;
    phone: string;
    linkedin?: string;
  };
  color: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopperDto {
  _id: string;
  name: string;
  exam: string;
  rank: string;
  score: string;
  image: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };
  imageUrl?: string;
  course: string;
  achievement: string;
  year: number;
  category: 'JEE Advanced' | 'JEE Main' | 'NEET' | 'Other';
  isActive: boolean;
  order: number;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogDto {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };
  imageUrl?: string;
  readTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPaginationDto {
  blogs: BlogDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface NotificationDto {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipient: {
    _id: string;
    name: string;
    email: string;
  };
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  timeAgo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationStatsDto {
  total: number;
  unread: number;
  today: number;
  byType: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
}

export interface NotificationPaginationDto {
  notifications: NotificationDto[];
  totalPages: number;
  currentPage: number;
  total: number;
  unreadCount: number;
}

const API_BASE ='http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAnnouncements(): Promise<AnnouncementDto[]> {
  const res = await fetch(`${API_BASE}/api/announcements`);
  if (!res.ok) throw new Error('Failed to fetch announcements');
  const json = await res.json();
  return json?.data?.announcements ?? [];
}

export async function fetchAllAnnouncements(): Promise<AnnouncementDto[]> {
  const res = await fetch(`${API_BASE}/api/announcements/manage`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch announcements');
  const json = await res.json();
  return json?.data?.announcements ?? [];
}

export async function createAnnouncement(payload: Partial<AnnouncementDto>): Promise<AnnouncementDto> {
  const res = await fetch(`${API_BASE}/api/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create announcement');
  const json = await res.json();
  return json?.data?.announcement;
}

export async function updateAnnouncement(id: string, payload: Partial<AnnouncementDto>): Promise<AnnouncementDto> {
  const res = await fetch(`${API_BASE}/api/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update announcement');
  const json = await res.json();
  return json?.data?.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
}

// Banner API functions
export async function fetchBanners(): Promise<BannerDto[]> {
  console.log('Fetching banners from:', `${API_BASE}/api/banners`);
  const res = await fetch(`${API_BASE}/api/banners`);
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Banner fetch error:', errorText);
    throw new Error(`Failed to fetch banners: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  console.log('Banner API response:', json);
  return json?.data?.banners ?? [];
}

export async function fetchAllBanners(): Promise<BannerDto[]> {
  const res = await fetch(`${API_BASE}/api/banners/manage`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch banners');
  const json = await res.json();
  return json?.data?.banners ?? [];
}

export async function createBanner(formData: FormData): Promise<BannerDto> {
  const res = await fetch(`${API_BASE}/api/banners`, {
    method: 'POST',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create banner');
  const json = await res.json();
  return json?.data?.banner;
}

export async function updateBanner(id: string, payload: Partial<BannerDto>): Promise<BannerDto> {
  const res = await fetch(`${API_BASE}/api/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update banner');
  const json = await res.json();
  return json?.data?.banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/banners/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete banner');
}

export async function toggleBanner(id: string): Promise<BannerDto> {
  const res = await fetch(`${API_BASE}/api/banners/${id}/toggle`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle banner');
  const json = await res.json();
  return json?.data?.banner;
}

export async function backendLogin(email: string, password: string): Promise<{ token: string; name: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const token = json?.data?.token as string | undefined;
    const name = json?.data?.user?.name as string | undefined;
    if (!token) return null;
    return { token, name: name || email };
  } catch {
    return null;
  }
}

// Course API functions
export async function fetchAllCourses(): Promise<CourseDto[]> {
  const res = await fetch(`${API_BASE}/api/courses/manage`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  const json = await res.json();
  return json?.data?.courses ?? [];
}

export async function createCourse(formData: FormData): Promise<CourseDto> {
  const res = await fetch(`${API_BASE}/api/courses`, {
    method: 'POST',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create course');
  const json = await res.json();
  return json?.data?.course;
}

export async function updateCourse(id: string, formData: FormData): Promise<CourseDto> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update course');
  const json = await res.json();
  return json?.data?.course;
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete course');
}

export async function toggleCourseStatus(id: string, status: string): Promise<CourseDto> {
  const res = await fetch(`${API_BASE}/api/courses/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update course status');
  const json = await res.json();
  return json?.data?.course;
}

// Team API functions
export async function fetchTeamMembers(): Promise<TeamMemberDto[]> {
  console.log('Fetching team members from:', `${API_BASE}/api/team`);
  const res = await fetch(`${API_BASE}/api/team`);
  console.log('Team members response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Team members fetch error:', errorText);
    throw new Error(`Failed to fetch team members: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  console.log('Team members API response:', json);
  const teamMembers = json?.data?.teamMembers ?? [];
  console.log('Team members with images:', teamMembers.map(m => ({ name: m.name, imageUrl: m.imageUrl })));
  return teamMembers;
}

export async function fetchAllTeamMembers(): Promise<TeamMemberDto[]> {
  console.log('Fetching all team members from:', `${API_BASE}/api/team/manage`);
  const res = await fetch(`${API_BASE}/api/team/manage`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  console.log('All team members response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('All team members fetch error:', errorText);
    throw new Error(`Failed to fetch all team members: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  console.log('All team members API response:', json);
  const teamMembers = json?.data?.teamMembers ?? [];
  console.log('All team members with images:', teamMembers.map(m => ({ name: m.name, imageUrl: m.imageUrl })));
  return teamMembers;
}

export async function createTeamMember(formData: FormData): Promise<TeamMemberDto> {
  const res = await fetch(`${API_BASE}/api/team`, {
    method: 'POST',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create team member');
  const json = await res.json();
  return json?.data?.teamMember;
}

export async function updateTeamMember(id: string, formData: FormData): Promise<TeamMemberDto> {
  const res = await fetch(`${API_BASE}/api/team/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update team member');
  const json = await res.json();
  return json?.data?.teamMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/team/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete team member');
}

export async function toggleTeamMember(id: string, isActive: boolean): Promise<TeamMemberDto> {
  const res = await fetch(`${API_BASE}/api/team/${id}/toggle`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle team member');
  const json = await res.json();
  return json?.data?.teamMember;
}

// Topper API functions
export async function fetchToppers(params?: { category?: string; year?: number; featured?: boolean; limit?: number }): Promise<TopperDto[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append('category', params.category);
  if (params?.year) searchParams.append('year', params.year.toString());
  if (params?.featured) searchParams.append('featured', params.featured.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_BASE}/api/toppers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  console.log('Fetching toppers from:', url);
  
  const res = await fetch(url);
  console.log('Toppers response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Toppers fetch error:', errorText);
    throw new Error(`Failed to fetch toppers: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  console.log('Toppers API response:', json);
  const toppers = json?.data?.toppers ?? [];
  console.log('Toppers with images:', toppers.map(t => ({ name: t.name, imageUrl: t.imageUrl })));
  return toppers;
}

export async function fetchAllToppers(): Promise<TopperDto[]> {
  console.log('Fetching all toppers from:', `${API_BASE}/api/toppers/manage`);
  const res = await fetch(`${API_BASE}/api/toppers/manage`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  console.log('All toppers response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('All toppers fetch error:', errorText);
    throw new Error(`Failed to fetch all toppers: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  console.log('All toppers API response:', json);
  const toppers = json?.data?.toppers ?? [];
  console.log('All toppers with images:', toppers.map(t => ({ name: t.name, imageUrl: t.imageUrl })));
  return toppers;
}

export async function createTopper(formData: FormData): Promise<TopperDto> {
  const res = await fetch(`${API_BASE}/api/toppers`, {
    method: 'POST',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create topper');
  const json = await res.json();
  return json?.data;
}

export async function updateTopper(id: string, formData: FormData): Promise<TopperDto> {
  const res = await fetch(`${API_BASE}/api/toppers/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update topper');
  const json = await res.json();
  return json?.data;
}

export async function deleteTopper(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/toppers/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete topper');
}

export async function toggleTopper(id: string, isActive: boolean): Promise<TopperDto> {
  const res = await fetch(`${API_BASE}/api/toppers/${id}/toggle`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle topper');
  const json = await res.json();
  return json?.data;
}

export async function toggleTopperFeatured(id: string, featured: boolean): Promise<TopperDto> {
  const res = await fetch(`${API_BASE}/api/toppers/${id}/featured`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle topper featured status');
  const json = await res.json();
  return json?.data;
}

export async function fetchTopperStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/toppers/stats`);
  if (!res.ok) throw new Error('Failed to fetch topper statistics');
  const json = await res.json();
  return json?.data;
}

// Blog API functions
export async function fetchBlogs(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<BlogPaginationDto> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.featured) searchParams.append('featured', params.featured.toString());

  const url = `${API_BASE}/api/blogs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch blogs');
  const json = await res.json();
  return json?.data;
}

export async function fetchFeaturedBlogs(): Promise<BlogDto[]> {
  const res = await fetch(`${API_BASE}/api/blogs/featured`);
  if (!res.ok) throw new Error('Failed to fetch featured blogs');
  const json = await res.json();
  return json?.data?.blogs || [];
}

export async function fetchBlogCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/blogs/categories`);
  if (!res.ok) throw new Error('Failed to fetch blog categories');
  const json = await res.json();
  return json?.data?.categories || [];
}

export async function fetchBlogBySlug(slug: string): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch blog');
  const json = await res.json();
  return json?.data?.blog;
}

export async function fetchAllBlogs(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}): Promise<BlogPaginationDto> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);

  const url = `${API_BASE}/api/blogs/manage/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch all blogs');
  const json = await res.json();
  return json?.data;
}

export async function fetchBlogForEdit(id: string): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs/manage/${id}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch blog for editing');
  const json = await res.json();
  return json?.data?.blog;
}

export async function createBlog(formData: FormData): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs`, {
    method: 'POST',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create blog');
  const json = await res.json();
  return json?.data?.blog;
}

export async function updateBlog(id: string, formData: FormData): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders() }, // Don't set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update blog');
  const json = await res.json();
  return json?.data?.blog;
}

export async function deleteBlog(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete blog');
}

export async function toggleBlogPublished(id: string): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}/toggle-published`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle blog published status');
  const json = await res.json();
  return json?.data?.blog;
}

export async function toggleBlogFeatured(id: string): Promise<BlogDto> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}/toggle-featured`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to toggle blog featured status');
  const json = await res.json();
  return json?.data?.blog;
}

// Notification API functions
export async function fetchMyNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationPaginationDto> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());

  const url = `${API_BASE}/api/notifications/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const json = await res.json();
  return json?.data || { notifications: [], totalPages: 0, currentPage: 1, total: 0, unreadCount: 0 };
}

export async function fetchAllNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  recipient?: string;
}): Promise<NotificationPaginationDto> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.type) searchParams.append('type', params.type);
  if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
  if (params?.recipient) searchParams.append('recipient', params.recipient);

  const url = `${API_BASE}/api/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch all notifications');
  const json = await res.json();
  console.log("All notifications response:", json);
  return json?.notifications || { notifications: [], totalPages: 0, currentPage: 1, total: 0, unreadCount: 0 };
}

export async function createNotification(payload: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  recipient?: string;
  actionUrl?: string;
  expiresAt?: string;
}): Promise<NotificationDto> {
  const res = await fetch(`${API_BASE}/api/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create notification');
  const json = await res.json();
  return json?.data || json;
}

export async function markNotificationAsRead(id: string): Promise<NotificationDto> {
  const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  const json = await res.json();
  return json?.data || json;
}

export async function markAllNotificationsAsRead(): Promise<{ message: string; modifiedCount: number }> {
  const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
  const json = await res.json();
  return json?.data || json;
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete notification');
}

export async function fetchNotificationStats(): Promise<NotificationStatsDto> {
  const res = await fetch(`${API_BASE}/api/notifications/stats`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch notification stats');
  const json = await res.json();
  return json?.data || json;
}