import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Target, Heart } from "lucide-react";
import type { FundingGoal, FundingProgress } from "@shared/schema";

export default function FundingSection() {
  const { data: goals, isLoading: goalsLoading } = useQuery<FundingGoal[]>({
    queryKey: ["/api/funding/goals"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<FundingProgress>({
    queryKey: ["/api/funding/progress"],
  });

  const getNextGoal = () => {
    if (!goals) return null;
    return goals.find(goal => !goal.isAchieved);
  };

  const getProgressPercentage = () => {
    if (!progress || !goals) return 0;
    const nextGoal = getNextGoal();
    if (!nextGoal) return 100;
    
    const currentAmount = parseFloat(progress.totalRaised);
    return Math.min((currentAmount / nextGoal.amount) * 100, 100);
  };

  const nextGoal = getNextGoal();

  return (
    <section id="funding" className="bg-gradient-to-br from-green-50 to-blue-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-green-600 text-white mb-6 text-lg px-6 py-2">
            <Heart className="w-5 h-5 mr-2" />
            Help Fund the Mission
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Join the Fight Against Scammers</h2>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Every contribution helps Packie protect more families from scam calls. 
            Support our mission to build the world's most advanced anti-scam AI.
          </p>
        </div>

        {/* Current Funding Progress */}
        <Card className="bg-gradient-primary text-white border-0 shadow-xl mb-12">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">
                {progressLoading ? (
                  <Skeleton className="h-16 w-40 mx-auto bg-white/20" />
                ) : progress ? (
                  `$${parseFloat(progress.totalRaised).toLocaleString()}`
                ) : (
                  "$0"
                )}
              </div>
              <div className="text-xl text-white/80">Raised so far</div>
              <div className="text-lg mt-2">
                Next Goal:{" "}
                <span className="font-semibold">
                  {nextGoal ? `$${nextGoal.amount.toLocaleString()}` : "All goals achieved!"}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 mb-4">
              <div
                className="bg-yellow-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>$0</span>
              <span>{getProgressPercentage().toFixed(1)}% to next milestone</span>
              <span>{nextGoal ? `$${nextGoal.amount.toLocaleString()}` : "Complete"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Funding Milestones */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {goalsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            goals?.slice(0, 3).map((goal) => (
              <Card
                key={goal.id}
                className={`border-0 shadow-lg relative ${
                  goal.isAchieved
                    ? "bg-green-50 border border-green-200"
                    : goal.id === nextGoal?.id
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                {goal.isAchieved && (
                  <Badge className="absolute -top-3 left-6 bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    ACHIEVED
                  </Badge>
                )}
                {goal.id === nextGoal?.id && (
                  <Badge className="absolute -top-3 left-6 bg-yellow-500 text-gray-900">
                    <Target className="w-3 h-3 mr-1" />
                    IN PROGRESS
                  </Badge>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    ${goal.amount.toLocaleString()}
                  </h3>
                  <h4
                    className={`text-lg font-semibold mb-4 ${
                      goal.isAchieved
                        ? "text-green-600"
                        : goal.id === nextGoal?.id
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {goal.title}
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    {goal.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check
                          className={`mr-2 w-4 h-4 ${
                            goal.isAchieved ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Future Goals Preview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {goals?.slice(3, 5).map((goal) => (
            <Card key={goal.id} className="bg-gray-50 border border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ${goal.amount.toLocaleString()}
                </h3>
                <h4 className="text-lg font-semibold text-purple-600 mb-4">{goal.title}</h4>
                <p className="text-gray-600 mb-4">{goal.description}</p>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Features Include:</div>
                  <div className="font-semibold">{goal.features.slice(0, 2).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Support CTA */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-green-200 text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Help Packie Fight Back?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your support directly funds AI development, phone infrastructure, and helps us reach more victims before scammers do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">$25</div>
              <div className="text-sm text-gray-600">Funds 100 scammer calls handled by Packie</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">$100</div>
              <div className="text-sm text-gray-600">Supports AI training for 1 month</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">$500</div>
              <div className="text-sm text-gray-600">Powers new persona development</div>
            </div>
          </div>

          <a 
            href="https://www.indiegogo.com/projects/packie-ai-the-trash-panda-that-fights-scams" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 text-2xl font-bold px-16 py-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
              <Heart className="w-6 h-6 mr-3" />
              Support on Indiegogo Now
            </Button>
          </a>
          
          <div className="mt-6 flex justify-center items-center space-x-8 text-gray-500">
            <div className="text-center">
              <div className="font-bold text-lg">
                {progressLoading ? (
                  <Skeleton className="inline-block h-6 w-16" />
                ) : (
                  progress?.backerCount.toLocaleString() || "0"
                )}
              </div>
              <div className="text-sm">Backers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">24/7</div>
              <div className="text-sm">Protection</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">1000+</div>
              <div className="text-sm">Scammers Stopped</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
