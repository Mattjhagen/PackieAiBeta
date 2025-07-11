import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      setLocation("/auth");
    } else if (!isLoading && user && requireAdmin && user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, isLoading, error, setLocation, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || error) {
    return null; // Will redirect to auth page
  }

  if (requireAdmin && user.role !== 'admin') {
    return null; // Will redirect to home page
  }

  return <>{children}</>;
}