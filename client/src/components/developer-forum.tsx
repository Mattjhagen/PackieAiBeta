import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Reply, Clock, User, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  replies: number;
  likes: number;
  status: 'open' | 'solved' | 'closed';
  tags: string[];
}

interface ForumReply {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isAnswer?: boolean;
}

export default function DeveloperForum() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: ""
  });

  // Mock data - in real app this would come from database
  const [forumPosts] = useState<ForumPost[]>([
    {
      id: 1,
      title: "How to configure Twilio webhooks for PackieAI?",
      content: "I'm having trouble setting up the webhook endpoints. The documentation shows the basic setup but I'm getting 404 errors when Twilio tries to reach my endpoints.",
      author: "dev_sarah",
      category: "integration",
      createdAt: "2024-06-01T10:30:00Z",
      replies: 3,
      likes: 5,
      status: 'solved',
      tags: ["twilio", "webhooks", "setup"]
    },
    {
      id: 2,
      title: "Custom personas not responding correctly",
      content: "I've created custom personas using the API but they seem to be giving generic responses instead of using the personality traits I defined. Any ideas?",
      author: "mike_codes",
      category: "personas",
      createdAt: "2024-05-31T15:45:00Z",
      replies: 7,
      likes: 12,
      status: 'open',
      tags: ["personas", "api", "customization"]
    },
    {
      id: 3,
      title: "Rate limiting on social media monitoring",
      content: "Getting rate limited on Twitter API calls. What's the recommended approach for managing API limits while maintaining effective monitoring?",
      author: "api_ninja",
      category: "monitoring",
      createdAt: "2024-05-30T09:15:00Z",
      replies: 2,
      likes: 8,
      status: 'open',
      tags: ["twitter", "rate-limiting", "monitoring"]
    },
    {
      id: 4,
      title: "Mobile app integration examples?",
      content: "Looking for examples of how to integrate PackieAI into mobile applications. Are there any React Native or Flutter SDKs available?",
      author: "mobile_dev",
      category: "mobile",
      createdAt: "2024-05-29T14:20:00Z",
      replies: 1,
      likes: 4,
      status: 'open',
      tags: ["mobile", "react-native", "flutter", "sdk"]
    }
  ]);

  const categories = [
    { id: "all", name: "All Categories", count: forumPosts.length },
    { id: "integration", name: "Integration", count: forumPosts.filter(p => p.category === "integration").length },
    { id: "personas", name: "Personas", count: forumPosts.filter(p => p.category === "personas").length },
    { id: "monitoring", name: "Social Monitoring", count: forumPosts.filter(p => p.category === "monitoring").length },
    { id: "mobile", name: "Mobile Development", count: forumPosts.filter(p => p.category === "mobile").length },
    { id: "general", name: "General", count: forumPosts.filter(p => p.category === "general").length }
  ];

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Post Created",
      description: "Your question has been posted to the forum"
    });

    setNewPost({ title: "", content: "", category: "general", tags: "" });
    setShowNewPost(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Can't find what you're looking for? Our community is here to help!
              </p>
              <Button 
                onClick={() => setShowNewPost(true)}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 space-y-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowNewPost(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPost && (
            <Card>
              <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
                <CardDescription>
                  Get help from the PackieAI developer community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your question about?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="integration">Integration</option>
                    <option value="personas">Personas</option>
                    <option value="monitoring">Social Monitoring</option>
                    <option value="mobile">Mobile Development</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="content">Question Details</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe your issue in detail. Include any error messages, code snippets, or steps you've already tried."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g. twilio, webhooks, api"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} className="bg-orange-500 hover:bg-orange-600">
                    Post Question
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forum Posts */}
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <Badge variant="outline">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-600 cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Reply className="w-4 h-4" />
                        <span>{post.replies} replies</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Be the first to start a conversation!"}
                </p>
                <Button 
                  onClick={() => setShowNewPost(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}