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
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                    Milestones
                </h3>

                <Button 
                    className="cursor-pointer bg-blue-400 hover:bg-blue-500 text-white transition-colors duration-200" 
                    onClick={() => setDialogVelocityOpen(true)}
                >
                    Velocity 🤟🏻
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-45 w-full bg-white/40" />
                    ))
                ) : (
                    milestones.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-10">No milestones found for this project.</div>
                    ) : (
                        milestones.map((milestone: Milestone, index: number) => {
                            const estimatedStart = new Date(milestone.estimated_start);
                            const estimatedFinish = new Date(milestone.estimated_finish);
                            const formattedStart = estimatedStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                            const formattedFinish = estimatedFinish.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

                            const closed_points = milestone.closed_points || 0;
                            const total_points = milestone.total_points || 0;
                            const progress = total_points > 0 ? (closed_points / total_points) * 100 : 0;

                            return (
                                <Card key={milestone.id || index} className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                                    <CardContent className="flex flex-col items-start">
                                        <h4 className="font-semibold">{milestone.name}</h4>
                                        <p className="text-sm text-gray-600">{formattedStart} - {formattedFinish}</p>

                                        <Progress value={progress} className="my-4" />

                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-sm text-gray-600">{closed_points} / {total_points} points</p>
                                            <Button variant="secondary" size="sm" className="bg-white cursor-pointer">
                                                <Link to={`/project/${project ? project.slug : '#'}/scrum/${milestone.id}`} className="flex items-center justify-center w-full">
                                                    Detail
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
                <DialogContent className="sm:max-w-3xl bg-white/80 backdrop-blur-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Team Velocity</DialogTitle>
                        <DialogDescription>
                            Showing your team's average completed points over the last 10 sprints.
                        </DialogDescription>
                    </DialogHeader>

                    <ChartContainer config={chartConfig}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
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
                                cursor={true}
                                content={<ChartTooltipContent />}
                            />
                            <Bar dataKey="closed_points" radius={[8, 8, 0, 0]} fill="#c4b5fd" className="fill-blue-400">
                                <LabelList
                                    position="top"
                                    offset={5}
                                    // className="fill-foreground"
                                    fontSize={12}

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