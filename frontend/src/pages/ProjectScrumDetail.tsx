import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import api from "@/lib/axios";
import type { Project } from "@/models/project";
import { useState } from "react";
import { useParams, useRouteLoaderData } from "react-router";
import { YAxis, XAxis, Bar, LabelList, BarChart, PieChart, Pie, Sector, CartesianGrid, Line, LineChart } from "recharts";
import useSWR from "swr";
import type { UserStory } from "@/models/user_story";
import { Badge } from "@/components/ui/badge";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import type { Milestone } from "@/models/milestone";

function ProjectScrumDetail() {

    const projectData = useRouteLoaderData<Project>('project');
    const [project] = useState<Project | null>(projectData || null);

    const milestoneId = useParams().milestoneId;

    const { data: milestone, error, isLoading } = useSWR<Milestone, Error>(`/api/milestone/${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const { data: userStories } = useSWR<UserStory[]>(`/api/user-stories?project=${project?.id}&milestone_id=${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
    });

    if (error) return <p>Failed to load milestone details.</p>;
    if (isLoading) return <p>Loading milestone details...</p>;
    if (!milestone) return <p>Milestone not found.</p>;

    const estimatedStart = new Date(milestone.estimated_start);
    const estimatedFinish = new Date(milestone.estimated_finish);
    const formattedStart = estimatedStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedFinish = estimatedFinish.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    // console.log("Milestone loaded:", milestone);

    // console.log("User Stories loaded:", userStories);

    const swimlaneColorMap = [
        // "#c4b5fd",
        "#a78bfa",
        "#8b5cf6",
        "#7c3aed",
        "#6d28d9",
        "#5b21b6",
        "#4c1d95",
        "#3b0764",
    ]

    const swimlaneChartData = Object.entries(milestone.count_swimlanes).map(([i, data]) => {
        return {
            swimlane: data.name,
            user_story: data.user_story,
            total_points: data.total_points,
            fill: swimlaneColorMap[parseInt(i) % swimlaneColorMap.length],
        }
    });

    const swimlaneChartConfig: ChartConfig = Object.entries(milestone.count_swimlanes).reduce(
        (acc, [, data], index) => {
            acc[data.name] = {
                label: data.name,
                color: swimlaneColorMap[index % swimlaneColorMap.length],
            }
            return acc
        },
        {} as ChartConfig
    )

    const tagsChartData = Object.entries(milestone.count_tags).map(([, data]) => ({
        tag: data.name,
        user_story: data.user_story,
        total_points: data.total_points,
    }));

    const tagsChartConfig = {
        user_story: {
            label: "User Story",
            color: "#c4b5fd",
        },
        total_points: {
            label: "Total Points",
            color: "#a78bfa",
        },
    } satisfies ChartConfig

    const statusChartData = Object.entries(milestone.count_statuses).map(([, data]) => {
        return {
            status: data.name,
            user_story: data.user_story,
            total_points: data.total_points,
        }
    })

    const statusChartConfig = {
        user_story: {
            label: "User Story",
            color: "var(--chart-1)",
        },
        total_points: {
            label: "Total Points",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap mb-3">
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {milestone.name}
                </h3>
                <p className="text-xl">
                    {formattedStart} - {formattedFinish}
                </p>
            </div>
            {/* Additional content can be added here */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-5">
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold">Total User Stories</h4>
                        <p className="text-3xl font-bold">{milestone.user_stories.length || 0}</p>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold">Closed Points</h4>
                        <p className="text-3xl font-bold">{milestone.closed_points || 0}</p>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold">Total Points</h4>
                        <p className="text-3xl font-bold">{milestone.total_points || 0}</p>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold">Progress</h4>
                        <p className="text-3xl font-bold">{milestone.total_points ? ((milestone.closed_points || 0) / milestone.total_points * 100).toFixed(2) : 0}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold mb-2">Swimlane Distribution</h4>

                        <ChartContainer
                            config={swimlaneChartConfig}
                            className="mx-auto aspect-square max-h-[350px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelKey="swimlane"
                                            formatter={(_value, _name, props) => {
                                                const data = props.payload
                                                return (
                                                    <div className="flex flex-col space-y-1 w-full">
                                                        <span className="flex justify-between">
                                                            <span className="text-muted-foreground">User Story</span>
                                                            <span className="font-mono">{data.user_story}</span>
                                                        </span>
                                                        <span className="flex justify-between">
                                                            <span className="text-muted-foreground">Total Points</span>
                                                            <span className="font-mono">{data.total_points}</span>
                                                        </span>
                                                    </div>
                                                )
                                            }}
                                        />
                                    }
                                />
                                <Pie
                                    data={swimlaneChartData}
                                    dataKey="user_story"
                                    nameKey="swimlane"
                                    innerRadius={50}
                                    strokeWidth={5}
                                    // activeIndex={0}
                                    activeShape={({
                                        outerRadius = 0,
                                        ...props
                                    }: PieSectorDataItem) => (
                                        <Sector {...props} outerRadius={outerRadius + 10} />
                                    )}
                                />
                                <ChartLegend
                                // content={<ChartLegendContent />}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent className="flexx flex-colx items-startx">
                        <h4 className="font-semibold mb-2">Tag Distribution</h4>

                        <ChartContainer config={tagsChartConfig}>
                            <BarChart
                                accessibilityLayer
                                data={tagsChartData}
                                layout="vertical"
                            >
                                <YAxis
                                    dataKey="tag"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={5}
                                    axisLine={false}
                                    tickFormatter={(value) => value}
                                    width={Math.max(...tagsChartData.map(d => d.tag.length)) * 7}
                                />
                                <XAxis dataKey="user_story" type="number" hide />
                                <ChartTooltip
                                    cursor={true}
                                    content={<ChartTooltipContent hideIndicator />}
                                />
                                <Bar dataKey="user_story" stackId="a" layout="vertical" radius={5} barSize={20} fill="var(--color-user_story)">
                                    <LabelList
                                        dataKey="user_story"
                                        position="right"
                                        offset={8}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                                <Bar dataKey="total_points" stackId="a" fill="transparent" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent>
                        <h4 className="font-semibold mb-2">Status Distribution</h4>

                        <ChartContainer config={statusChartConfig}>
                            <LineChart
                                accessibilityLayer
                                data={statusChartData}
                                margin={{
                                    left: 20,
                                    right: 20,
                                    bottom: 20,
                                    top: 20,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="status"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    interval={0}
                                    angle={-25}
                                    padding={{ left: 10, right: 10 }}
                                // tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(_value, _name, props) => {
                                                const data = props.payload
                                                return (
                                                    <div className="flex flex-col space-y-1 w-full">
                                                        <span className="flex justify-between">
                                                            <span className="text-muted-foreground">User Story</span>
                                                            <span className="font-mono">{data.user_story}</span>
                                                        </span>
                                                        <span className="flex justify-between">
                                                            <span className="text-muted-foreground">Total Points</span>
                                                            <span className="font-mono">{data.total_points}</span>
                                                        </span>
                                                    </div>
                                                )
                                            }}
                                        />
                                    }
                                />
                                <Line
                                    dataKey="user_story"
                                    type="monotone"
                                    stroke="var(--color-user_story)"
                                    strokeWidth={2}
                                    dot={{
                                        fill: "var(--color-user_story)",
                                    }}
                                // activeDot={{
                                //     r: 6,
                                // }}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent className="h-full">
                        {/* <h4 className="font-semibold mb-2">Status Distribution</h4> */}

                        <div className="flex items-center justify-center h-full">
                            <p className="text-2xl text-muted-foreground">Loading...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-5 mt-5">
                <Card className="transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                    <CardContent className="flexx flex-colx items-startx">
                        <h4 className="font-semibold">User Stories</h4>
                        <Table>
                            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>User Story</TableHead>
                                    <TableHead>Closed Story</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userStories && userStories.map((story, index) => {

                                    let swimlane = "";
                                    if (project && project.swimlanes && Array.isArray(project.swimlanes)) {
                                        project.swimlanes.forEach((swimlaneData) => {
                                            if (story.swimlane == swimlaneData.id) {
                                                swimlane = swimlaneData.name;
                                            }
                                        });
                                    }

                                    return (
                                        <TableRow key={story.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {swimlane && <><b className="text-gray-700">{swimlane}</b></>}
                                                <br />
                                                <a href={story.url} target="_blank">{story.subject}</a>
                                                <div className="mt-1">
                                                    {story.tags.map((tag, tagIndex) => (
                                                        <Badge key={tagIndex} className="text-xs text-white mr-1.5" style={{ backgroundColor: tag[1] }}>
                                                            {tag[0]}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={story.is_closed ? 'bg-rose-300' : 'bg-green-300'}>
                                                    {story.is_closed ? 'Closed' : 'Open'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={"outline"} className="bg-white" style={{ color: story.status_extra_info.color }}>
                                                    {story.status_extra_info.name}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

export default ProjectScrumDetail;