import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  User,
  MessageCircle
} from "lucide-react";

interface ForumQuestion {
  id: number;
  title: string;
  content: string;
  authorName: string;
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  votes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface ForumAnswer {
  id: number;
  questionId: number;
  content: string;
  authorName: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommunityQA() {
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newQuestionTags, setNewQuestionTags] = useState("");
  const [newAnswerContent, setNewAnswerContent] = useState("");
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/forum/questions'],
  });

  // Fetch answers for selected question
  const { data: answers = [], isLoading: answersLoading } = useQuery({
    queryKey: ['/api/forum/questions', selectedQuestion?.id, 'answers'],
    enabled: !!selectedQuestion,
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: { title: string; content: string; tags: string[] }) => {
      return apiRequest('/api/forum/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/questions'] });
      setNewQuestionTitle("");
      setNewQuestionContent("");
      setNewQuestionTags("");
      setIsQuestionDialogOpen(false);
      toast({
        title: "Question posted!",
        description: "Your question has been posted to the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create answer mutation
  const createAnswerMutation = useMutation({
    mutationFn: async (answerData: { content: string }) => {
      return apiRequest(`/api/forum/questions/${selectedQuestion?.id}/answers`, {
        method: 'POST',
        body: JSON.stringify(answerData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/questions', selectedQuestion?.id, 'answers'] });
      setNewAnswerContent("");
      toast({
        title: "Answer posted!",
        description: "Your answer has been added to the discussion.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your question.",
        variant: "destructive",
      });
      return;
    }

    const tags = newQuestionTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createQuestionMutation.mutate({
      title: newQuestionTitle,
      content: newQuestionContent,
      tags,
    });
  };

  const handleCreateAnswer = () => {
    if (!newAnswerContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please provide content for your answer.",
        variant: "destructive",
      });
      return;
    }

    createAnswerMutation.mutate({
      content: newAnswerContent,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 border-green-200';
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
            ← Back to Questions
          </Button>
        </div>

        {/* Question Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{selectedQuestion.title}</CardTitle>
                <CardDescription className="mt-2">
                  Asked by {selectedQuestion.authorName} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(selectedQuestion.priority)}>
                  {selectedQuestion.priority}
                </Badge>
                <Badge className={getStatusColor(selectedQuestion.status)}>
                  {selectedQuestion.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedQuestion.content}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-4">
              {selectedQuestion.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Answers ({answers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {answersLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading answers...</div>
                ) : answers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No answers yet. Be the first to help!
                  </div>
                ) : (
                  answers.map((answer: ForumAnswer) => (
                    <div key={answer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{answer.authorName}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </span>
                          {answer.isAccepted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">{answer.votes}</span>
                          <Button variant="ghost" size="sm">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{answer.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Add Answer Form */}
            <div className="mt-6 pt-6 border-t">
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
                placeholder="Share your knowledge and help the community..."
                className="mt-2"
                rows={4}
              />
              <Button 
                onClick={handleCreateAnswer}
                disabled={createAnswerMutation.isPending}
                className="mt-3"
              >
                <Send className="h-4 w-4 mr-2" />
                {createAnswerMutation.isPending ? 'Posting...' : 'Post Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Q&A</h2>
          <p className="text-gray-600">Ask questions and share knowledge with the PackieAI community</p>
        </div>
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
              <DialogDescription>
                Get help from the community by asking a clear, detailed question.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="What's your question about?"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="content">Question Details</Label>
                <Textarea
                  id="content"
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  placeholder="Provide more details about your question..."
                  className="mt-2"
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newQuestionTags}
                  onChange={(e) => setNewQuestionTags(e.target.value)}
                  placeholder="api, integration, webhook, etc."
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateQuestion}
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? 'Posting...' : 'Post Question'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-4">Be the first to ask a question and start the conversation!</p>
              <Button onClick={() => setIsQuestionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ask the First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question: ForumQuestion) => (
            <Card 
              key={question.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedQuestion(question)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {question.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Asked by {question.authorName} • {new Date(question.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(question.priority)}>
                      {question.priority}
                    </Badge>
                    <Badge className={getStatusColor(question.status)}>
                      {question.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{question.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-wrap gap-1">
                    {question.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {question.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{question.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="h-4 w-4" />
                      {question.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {question.views} views
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}