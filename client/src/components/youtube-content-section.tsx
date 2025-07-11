import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { YoutubeContent } from "@shared/schema";
import { Play, Clock, Eye, ThumbsUp, Calendar, VideoIcon, CheckCircle, Upload, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function YoutubeContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState<number | null>(null);

  const playContent = (content: YoutubeContent) => {
    if (isPlaying === content.id) {
      speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.script);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsPlaying(content.id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    speechSynthesis.speak(utterance);
  };

  const { data: youtubeContent, isLoading } = useQuery<YoutubeContent[]>({
    queryKey: ['/api/youtube-content'],
  });

  const { data: topContent, isLoading: isLoadingTop } = useQuery<YoutubeContent[]>({
    queryKey: ['/api/youtube-content/top'],
  });

  const generateContentMutation = useMutation({
    mutationFn: () => apiRequest('/api/youtube-content/generate', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Content Generation Started",
        description: "YouTube content is being generated from the best scammer interactions.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-content'] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to start YouTube content generation.",
        variant: "destructive",
      });
    },
  });

  const approveContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/youtube-content/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Content Approved",
        description: "YouTube content has been approved for publishing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-content'] });
    },
  });

  const publishContentMutation = useMutation({
    mutationFn: ({ id, youtube_video_id }: { id: number; youtube_video_id?: string }) => 
      apiRequest(`/api/youtube-content/${id}/publish`, { method: 'POST', body: JSON.stringify({ youtube_video_id }) }),
    onSuccess: () => {
      toast({
        title: "Content Published",
        description: "YouTube content has been marked as published.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-content'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <VideoIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Content Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform the best scammer interactions into engaging YouTube content. 
            Our AI analyzes calls for entertainment value and creates video-ready content.
          </p>
          
          <Button 
            onClick={() => generateContentMutation.mutate()}
            disabled={generateContentMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {generateContentMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate New Content
              </>
            )}
          </Button>
        </div>

        {/* Top Performing Content */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Top Performing Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTop ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : topContent && topContent.length > 0 ? (
              topContent.map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                      {getStatusBadge(content.status)}
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {content.scam_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                      {content.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {content.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {content.engagement_score || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playContent(content)}
                        className="flex items-center gap-1"
                      >
                        {isPlaying === content.id ? (
                          <>
                            <VolumeX className="h-3 w-3" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            Listen
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No top content available yet. Generate some content to get started!
              </div>
            )}
          </div>
        </div>

        {/* All Content */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">All Generated Content</h3>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : youtubeContent && youtubeContent.length > 0 ? (
              youtubeContent.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{content.title}</h4>
                          {getStatusBadge(content.status)}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{content.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {content.tags && Array.isArray(content.tags) && content.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{content.scam_type}</span>
                          <span>Generated Content</span>
                          <span>Score: {content.engagement_score || 0}</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playContent(content)}
                          className="flex items-center gap-1"
                        >
                          {isPlaying === content.id ? (
                            <>
                              <VolumeX className="h-3 w-3" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3 w-3" />
                              Listen
                            </>
                          )}
                        </Button>
                        {content.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveContentMutation.mutate(content.id)}
                            disabled={approveContentMutation.isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                        )}
                        {content.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => publishContentMutation.mutate({ id: content.id })}
                            disabled={publishContentMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            Publish
                          </Button>
                        )}
                        {content.youtube_video_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://youtube.com/watch?v=${content.youtube_video_id}`, '_blank')}
                          >
                            <Play className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <VideoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Generated Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start generating YouTube content from your best scammer interactions.
                  </p>
                  <Button 
                    onClick={() => generateContentMutation.mutate()}
                    disabled={generateContentMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate First Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}