import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CommunityQA from "@/components/community-qa";
import { 
  Shield, 
  Users, 
  Settings, 
  Code, 
  FileText, 
  MessageSquare, 
  Upload, 
  Download,
  Eye,
  Edit,
  Crown,
  CheckCircle,
  XCircle
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isVerified: boolean;
  createdAt: string;
}

export default function DeveloperPortal() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Get all users (admin only)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: currentUser?.user?.role === 'admin' || currentUser?.user?.username === 'superuser',
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number; permissions: string[] }) => {
      return apiRequest(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Permissions updated",
        description: "User permissions have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions.",
        variant: "destructive",
      });
    },
  });

  const availablePermissions = [
    { key: 'forum_read', label: 'Forum Read', description: 'View forum posts and discussions' },
    { key: 'forum_write', label: 'Forum Write', description: 'Create posts and reply to discussions' },
    { key: 'api_docs_read', label: 'API Docs Read', description: 'View API documentation' },
    { key: 'csv_upload', label: 'CSV Upload', description: 'Upload CSV files for data processing' },
    { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Access detailed analytics and reports' },
    { key: 'admin_panel', label: 'Admin Panel', description: 'Access administrative functions' },
  ];

  const togglePermission = (userId: number, permission: string, currentPermissions: string[]) => {
    const hasPermission = currentPermissions.includes(permission);
    const newPermissions = hasPermission
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    updatePermissionsMutation.mutate({ userId, permissions: newPermissions });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-orange-100 text-orange-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageUsers = currentUser?.user?.role === 'admin' || currentUser?.user?.username === 'superuser';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the PackieAI Developer Portal, {currentUser?.user?.username}
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api-docs" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API Docs
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Tools
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Email Verified</span>
                      {currentUser?.user?.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Role</span>
                      <Badge className={getRoleColor(currentUser?.user?.role || 'user')}>
                        {currentUser?.user?.role || 'user'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(currentUser?.user?.permissions || []).map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{permission.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedTab("api-docs")}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      View API Documentation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedTab("community")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Browse Community Forum
                    </Button>
                    {(currentUser?.user?.permissions || []).includes('csv_upload') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setSelectedTab("tools")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV Data
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api-docs">
            <Card>
              <CardHeader>
                <CardTitle>PackieAI API Documentation</CardTitle>
                <CardDescription>
                  Complete API reference for integrating with PackieAI services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Secure your API requests with proper authentication
                      </p>
                      <code className="bg-gray-100 p-2 rounded text-sm block">
                        POST /api/auth/login<br/>
                        GET /api/auth/user
                      </code>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Call Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Manage and monitor scam call interactions
                      </p>
                      <code className="bg-gray-100 p-2 rounded text-sm block">
                        GET /api/calls<br/>
                        POST /api/calls/report
                      </code>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Access AI personas and their configurations
                      </p>
                      <code className="bg-gray-100 p-2 rounded text-sm block">
                        GET /api/personas<br/>
                        GET /api/personas/:id
                      </code>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Retrieve analytics and performance metrics
                      </p>
                      <code className="bg-gray-100 p-2 rounded text-sm block">
                        GET /api/analytics/latest<br/>
                        GET /api/analytics/daily
                      </code>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">1. Authentication</h4>
                      <p className="text-sm text-gray-600">
                        All API requests require authentication. Use your account credentials to obtain a session token.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">2. Rate Limits</h4>
                      <p className="text-sm text-gray-600">
                        API requests are limited to 1000 requests per hour per user.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">3. Response Format</h4>
                      <p className="text-sm text-gray-600">
                        All responses are returned in JSON format with consistent error handling.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <CommunityQA />
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>
                  Upload data and access advanced features based on your permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(currentUser?.user?.permissions || []).includes('csv_upload') ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload CSV Files</h3>
                      <p className="text-gray-600 mb-4">
                        Upload CSV files containing scam phone numbers, call data, or other relevant information
                      </p>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">CSV Format Guide</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            <li>• Phone numbers in E.164 format</li>
                            <li>• Include headers in first row</li>
                            <li>• Maximum 10,000 rows per file</li>
                            <li>• Supported formats: .csv, .txt</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Processing Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Files uploaded today:</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Records processed:</span>
                              <span className="font-medium">0</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">CSV Upload Not Available</h3>
                    <p className="text-gray-600">
                      You don't have permission to upload CSV files. Contact an administrator to request access.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManageUsers && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user permissions and access levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Permissions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                {availablePermissions.map((permission) => (
                                  <div key={permission.key} className="flex items-center justify-between">
                                    <span className="text-sm">{permission.label}</span>
                                    <Switch
                                      checked={user.permissions.includes(permission.key)}
                                      onCheckedChange={() => togglePermission(user.id, permission.key, user.permissions)}
                                      disabled={updatePermissionsMutation.isPending}
                                    />
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}