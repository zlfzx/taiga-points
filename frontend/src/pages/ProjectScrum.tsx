import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DialogHeader } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import type { Milestone } from "@/models/milestone";
import type { Project } from "@/models/project";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BarChart } from "recharts";
import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import { CartesianGrid, XAxis, Bar, LabelList } from "recharts";
import useSWR from 'swr'
import { Badge } from "@/components/ui/badge";
import { Inbox, Calendar, Target, BarChart2 } from "lucide-react";

function ProjectScrum() {
    const project = useRouteLoaderData<Project>('project');
    // const [milestones, setMilestones] = useState([]);
    const [dialogVelocityOpen, setDialogVelocityOpen] = useState(false);

    const { data: milestones, error, isLoading } = useSWR(project ? `/api/milestones?project=${project.id}` : null, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
    });

    // const chartData = [
    //     { month: "Sprint 1 Q1 - 7 Jan 2025", desktop: 186 },
    //     { month: "Sprint 2 Q1 - 4 Feb 2025", desktop: 305 },
    //     { month: "March", desktop: 237 },
    //     { month: "April", desktop: 73 },
    //     { month: "May", desktop: 209 },
    //     { month: "June", desktop: 214 },
    //     { month: "July", desktop: 200 },
    //     { month: "August", desktop: 300 },
    //     { month: "September", desktop: 250 },
    // ]
    // const chartConfig = {
    //     desktop: {
    //         label: "Desktop",
    //         color: "#4F46E5", // indigo-600
    //     },
    // } satisfies ChartConfig

    const chartData = (milestones ?? []).slice().reverse().slice(-10).map((milestone: Milestone) => {
        return {
            sprint: milestone.name,
            closed_points: milestone.closed_points || 0,
        };
    });

    const chartConfig = {
        closed_points: {
            label: "Closed Points",
            color: "#c4b5fd", // indigo-600
        },
    } satisfies ChartConfig;


    if (error) return <p>Failed to load milestones.</p>;

    return (
        <>
            <div className="flex justify-between items-center">
                <h3 className="scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1 mb-2">
                    Milestones
                </h3>

                <Button 
                    variant="outline"
                    className="cursor-pointer bg-white text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors duration-200 shadow-sm" 
                    onClick={() => setDialogVelocityOpen(true)}
                >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Team Velocity
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-45 w-full bg-white/40" />
                    ))
                ) : (
                    milestones.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-center text-muted-foreground py-20 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
                            <Inbox className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg">No milestones found for this project.</p>
                        </div>
                    ) : (
                        milestones.map((milestone: Milestone, index: number) => {
                            const estimatedStart = new Date(milestone.estimated_start);
                            const estimatedFinish = new Date(milestone.estimated_finish);
                            const formattedStart = estimatedStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                            const formattedFinish = estimatedFinish.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

                            const closed_points = milestone.closed_points || 0;
                            const total_points = milestone.total_points || 0;
                            const progress = total_points > 0 ? (closed_points / total_points) * 100 : 0;
                            
                            let statusBadge = null;
                            const now = new Date();
                            if (milestone.closed) {
                                statusBadge = <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">Completed</Badge>;
                            } else if (now >= estimatedStart && now <= estimatedFinish) {
                                statusBadge = <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none">Active</Badge>;
                            } else if (now < estimatedStart) {
                                statusBadge = <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none">Upcoming</Badge>;
                            } else {
                                statusBadge = <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">Overdue</Badge>;
                            }

                            return (
                                <Card key={milestone.id || index} className="flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                                    <CardContent className="flex flex-col flex-1 px-5">
                                        <div className="mb-2">
                                            {statusBadge}
                                        </div>
                                        <h4 className="font-semibold text-lg leading-tight text-gray-900 mb-4">{milestone.name}</h4>
                                        
                                        <div className="flex items-center text-sm text-gray-500 mb-5">
                                            <Calendar className="w-4 h-4 mr-2 shrink-0 text-blue-400" />
                                            <span>{formattedStart} - {formattedFinish}</span>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <div className="flex items-center font-medium text-gray-700">
                                                    <Target className="w-4 h-4 mr-1.5 text-blue-500" />
                                                    {closed_points} / {total_points} pts
                                                </div>
                                                <span className="text-gray-500 font-semibold">{progress.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2 mb-5 bg-gray-200" />

                                            <Button variant="secondary" className="w-full bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-700 transition-colors duration-200 cursor-pointer shadow-sm">
                                                <Link to={`/project/${project ? project.slug : '#'}/scrum/${milestone.id}`} className="flex items-center justify-center w-full py-1">
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }))
                )}
            </div>

            <Dialog open={dialogVelocityOpen} onOpenChange={setDialogVelocityOpen}>
                <DialogContent className="sm:max-w-4xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl p-8" aria-describedby={undefined}>
                    <DialogHeader className="pb-4 border-b border-gray-200/50 mb-4">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Team Velocity</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium mt-1">
                            Showing your team's average completed points over the last 10 sprints.
                        </DialogDescription>
                    </DialogHeader>

                    <ChartContainer config={chartConfig}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 25,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="sprint"
                                tickLine={false}
                                axisLine={false}
                                // angle={-30}
                                interval={0}
                                padding={{ left: 10, right: 10 }}
                                // textAnchor="end"
                                fontSize={10}
                                tickFormatter={(value => {
                                    const [sprint] = value.split('-');
                                    return sprint.trim();
                                })}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                content={<ChartTooltipContent />}
                            />
                            <Bar dataKey="closed_points" radius={[6, 6, 0, 0]} fill="#3b82f6" className="fill-blue-600/90 hover:fill-blue-700 transition-colors">
                                <LabelList
                                    position="top"
                                    offset={8}
                                    className="fill-blue-900 font-semibold"
                                    fontSize={13}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ProjectScrum;