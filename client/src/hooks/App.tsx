import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import DeveloperPortal from "@/pages/developer-portal";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/protected-route";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/developer">
            <ProtectedRoute>
              <DeveloperPortal />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;