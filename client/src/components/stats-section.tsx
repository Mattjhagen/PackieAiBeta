import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analytics, FundingProgress } from "@shared/schema";

export default function StatsSection() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: fundingProgress, isLoading: fundingLoading } = useQuery<FundingProgress>({
    queryKey: ["/api/funding/progress"],
  });

  const statsData = [
    {
      value: fundingProgress?.backerCount || 0,
      label: "Scammers Wasted",
      loading: analyticsLoading,
    },
    {
      value: analytics?.totalDuration || 0,
      label: "Hours Wasted",
      loading: analyticsLoading,
    },
    {
      value: analytics?.successRate ? `${analytics.successRate}%` : "0%",
      label: "Success Rate",
      loading: analyticsLoading,
    },
    {
      value: analytics?.scamsPrevented ? `$${(parseFloat(analytics.scamsPrevented) / 1000000).toFixed(1)}M` : "$0",
      label: "Scams Prevented",
      loading: analyticsLoading,
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center p-6 border-0 shadow-sm">
              {stat.loading ? (
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
              ) : (
                <div className="text-3xl font-bold text-primary mb-2">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              )}
              <p className="text-gray-600">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
