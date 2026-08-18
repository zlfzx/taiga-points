import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import api from "@/lib/axios";
import type { Project } from "@/models/project";
import { useMemo, useState, useRef } from "react";
import { useParams, useRouteLoaderData } from "react-router";
import { PieChart, Pie, Sector } from "recharts";
import useSWR from "swr";
import type { UserStory } from "@/models/user_story";
import { Badge } from "@/components/ui/badge";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import type { Milestone, MilestoneTeamWorkload } from "@/models/milestone";
import userImg from "@/assets/user.png";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, FileX, Target, CheckCircle2, BarChart3, Search, Calendar, Download, Layers } from "lucide-react";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";

type SortConfig = {
    key: string
    direction: "asc" | "desc"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj)
}

function ProjectScrumDetail() {

    const projectData = useRouteLoaderData<Project>('project');
    const [project] = useState<Project | null>(projectData || null);

    const milestoneId = useParams().milestoneId;

    const { data: milestone, error, isLoading } = useSWR<Milestone, Error>(`/api/milestone/${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const { data: userStoriesData } = useSWR<UserStory[]>(`/api/user-stories?project=${project?.id}&milestone_id=${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
    });

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [searchStory, setSearchStory] = useState("");
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const userStories = useMemo(() => {
        if (!userStoriesData) return [];
        let filtered = userStoriesData;
        
        if (searchStory) {
            const lowerQuery = searchStory.toLowerCase();
            filtered = filtered.filter(story => 
                story.subject.toLowerCase().includes(lowerQuery) || 
                (story.ref && story.ref.toString().includes(lowerQuery))
            );
        }

        if (!sortConfig) return filtered;

        return [...filtered].sort((a, b) => {
            const aValue = getValueByPath(a, sortConfig.key)
            const bValue = getValueByPath(b, sortConfig.key)

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortConfig.direction === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortConfig.direction === "asc"
                    ? aValue - bValue
                    : bValue - aValue
            }
            return 0
        })
    }, [userStoriesData, sortConfig, searchStory]);

    const sortUserStories = (key: string) => {
        let direction: "asc" | "desc" = "asc"
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    const { data: milestoneTeamWorkload } = useSWR<MilestoneTeamWorkload[]>(`/api/milestone/team-workload?project=${project?.id}&milestone_id=${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
    });

    if (error) return <p>Failed to load milestone details.</p>;
    if (isLoading) return (
        <div className="space-y-5">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
            </div>
        </div>
    );
    if (!milestone) return <p>Milestone not found.</p>;

    const estimatedStart = new Date(milestone.estimated_start);
    const estimatedFinish = new Date(milestone.estimated_finish);
    const formattedStart = estimatedStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedFinish = estimatedFinish.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const progress = milestone.total_points ? (milestone.closed_points || 0) / milestone.total_points * 100 : 0;


    const swimlaneColorMap = [
        "#0ea5e9", // sky-500
        "#14b8a6", // teal-500
        "#3b82f6", // blue-500
        "#6366f1", // indigo-500
        "#06b6d4", // cyan-500
        "#8b5cf6", // violet-500
        "#10b981", // emerald-500
    ];

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



    const statusColorMap = [
        "#10b981", // emerald-500
        "#3b82f6", // blue-500
        "#f59e0b", // amber-500
        "#8b5cf6", // violet-500
        "#ec4899", // pink-500
        "#ef4444", // red-500
        "#64748b", // slate-500
    ];

    const totalStatusStories = Object.values(milestone.count_statuses).reduce((acc, curr) => acc + curr.user_story, 0);



    const handleDownloadPdf = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);
        
        try {
            // Temporarily expand scrolling containers so they render fully
            const scrollContainers = printRef.current.querySelectorAll('.overflow-y-auto, .overflow-x-auto');
            scrollContainers.forEach((el: any) => {
                el.dataset.originalMaxHeight = el.style.maxHeight;
                el.dataset.originalOverflow = el.style.overflow;
                el.style.maxHeight = 'none';
                el.style.overflow = 'visible';
            });

            // Filter to exclude cross-origin images (like Taiga avatars) that cause CORS errors
            const filter = (node: HTMLElement) => {
                if (node.tagName === 'IMG') {
                    const src = (node as HTMLImageElement).src;
                    if (src && !src.startsWith('data:') && !src.startsWith(window.location.origin)) {
                        return false; 
                    }
                }
                return true;
            };

            // Capture the DOM as a high-res image using html-to-image which natively supports oklch and modern CSS
            const imgData = await htmlToImage.toPng(printRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                filter: filter,
            });

            // Restore original styles
            scrollContainers.forEach((el: any) => {
                el.style.maxHeight = el.dataset.originalMaxHeight || '';
                el.style.overflow = el.dataset.originalOverflow || '';
            });

            const imgProps = new Image();
            imgProps.src = imgData;
            await new Promise((resolve) => { imgProps.onload = resolve; });
            
            // Create PDF with exact dimensions
            const pdf = new jsPDF({
                orientation: imgProps.width > imgProps.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [imgProps.width, imgProps.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgProps.width, imgProps.height);
            pdf.save(`Dashboard_${milestone.name}.pdf`);

        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div ref={printRef} className="bg-white p-4 sm:p-6 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap mb-3">
                <div>
                    <h3 className="scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1">
                        {milestone.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        {formattedStart} <span className="mx-2 text-gray-300">|</span> {formattedFinish}
                    </p>
                </div>
                <Button 
                    variant="secondary" 
                    className="bg-white shadow-md cursor-pointer print:hidden hover:bg-white/60 hidden" 
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                        <Download className="w-5 h-5 mr-2 text-blue-600" />
                    )}
                    {isDownloading ? "Generating PDF..." : "Export PDF"}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-5">
                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStatusStories || 0}</div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{milestone.total_points || 0}</div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed Points</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{milestone.closed_points || 0}</div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.toFixed(2)}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-5 mt-5">
                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10 lg:col-span-1">
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
                                                            <span className="text-muted-foreground mr-4">User Story</span>
                                                            <span className="font-mono">{data.user_story}</span>
                                                        </span>
                                                        <span className="flex justify-between">
                                                            <span className="text-muted-foreground mr-4">Total Points</span>
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
                                    activeShape={({
                                        outerRadius = 0,
                                        ...props
                                    }: PieSectorDataItem) => (
                                        <Sector {...props} outerRadius={outerRadius + 10} />
                                    )}
                                />
                                <ChartLegend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10 h-full flex flex-col lg:col-span-2">
                    <CardContent className="flex-1">
                        <h4 className="font-semibold mb-4">Team Workload</h4>

                        <div className="overflow-y-auto max-h-[350px] pr-2 print:overflow-visible print:max-h-none print:pr-0">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-center">Stories</TableHead>
                                        <TableHead className="text-center">Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {milestoneTeamWorkload && milestoneTeamWorkload.length > 0 ? milestoneTeamWorkload.map((workload) => (
                                        <TableRow key={workload.member_id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <img
                                                        src={workload.member.photo || userImg}
                                                        alt={workload.member.full_name}
                                                        className="w-8 h-8 rounded-full shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800 leading-tight">{workload.member.full_name}</p>
                                                        <p className="text-xs text-blue-600">{workload.member.role_name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">{workload.total_story}</TableCell>
                                            <TableCell className="text-center font-bold text-blue-600">{workload.total_point}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <Users className="w-10 h-10 text-gray-300" />
                                                    <p>No workload data.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 mt-8 items-stretch">
                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10 w-full overflow-hidden h-full flex flex-col">
                    <CardContent className="flex-1">
                        <h4 className="font-semibold mb-6">Status Distribution</h4>

                        <div className="mb-6">
                            <div className="flex h-5 w-full rounded-full overflow-hidden border border-white/40 shadow-inner bg-gray-100">
                                {Object.entries(milestone.count_statuses).map(([_, data], index) => {
                                    const width = totalStatusStories > 0 ? (data.user_story / totalStatusStories) * 100 : 0;
                                    if (width === 0) return null;
                                    return (
                                        <div 
                                            key={index}
                                            style={{ width: `${width}%`, backgroundColor: statusColorMap[index % statusColorMap.length] }}
                                            className="h-full transition-all duration-500 ease-in-out relative group cursor-pointer hover:brightness-110"
                                            title={`${data.name}: ${data.user_story} stories (${width.toFixed(1)}%)`}
                                        >
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(milestone.count_statuses).map(([_, data], index) => {
                                const width = totalStatusStories > 0 ? (data.user_story / totalStatusStories) * 100 : 0;
                                return (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColorMap[index % statusColorMap.length] }}></span>
                                        <div>
                                            <span className="text-gray-800 font-medium mr-1.5">{data.name}</span>
                                            <span className="text-gray-500 text-xs">{data.user_story} ({width.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10 w-full overflow-hidden h-full flex flex-col">
                    <CardContent className="flex-1">
                        <h4 className="font-semibold mb-6">Tag Distribution</h4>

                        <div className="flex flex-wrap gap-3">
                            {tagsChartData.length > 0 ? (
                                tagsChartData.sort((a, b) => b.user_story - a.user_story).map((data, index) => {
                                    const isTop = index < 3;
                                    return (
                                        <div 
                                            key={index} 
                                            className={`flex items-center px-3 py-1.5 rounded-full border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default ${
                                                isTop 
                                                ? "bg-blue-50 border-blue-200 text-blue-800" 
                                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                            }`}
                                            title={`${data.user_story} stories, ${data.total_points} pts`}
                                        >
                                            <span className="text-sm font-medium mr-2">{data.tag}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                isTop ? "bg-blue-200/60 text-blue-900" : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {data.user_story}
                                            </span>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-gray-500 text-sm py-4">No tags found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-5 mt-5">
                <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg">User Stories</h4>
                            <div className="relative w-full md:w-64 mt-3 md:mt-0 print:hidden">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search stories or #ref..."
                                    className="pl-9 bg-white shadow-sm"
                                    value={searchStory}
                                    onChange={(e) => setSearchStory(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto print:overflow-visible">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Ref</TableHead>
                                    <TableHead>User Story</TableHead>
                                    <TableHead className="text-center w-24">Points</TableHead>
                                    <TableHead className="text-center w-24">State</TableHead>
                                    <TableHead className="flex items-center justify-center cursor-pointer" onClick={() => sortUserStories("status_extra_info.order")}>
                                        Status
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 ml-1">
                                            <path fillRule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clipRule="evenodd" />
                                        </svg>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userStories && userStories.map((story) => {

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
                                            <TableCell className="font-medium text-gray-400">#{story.ref}</TableCell>
                                            <TableCell className="py-4">
                                                {swimlane && <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">{swimlane}</div>}
                                                <a href={story.url} target="_blank" className="text-wrap font-semibold text-blue-700 hover:text-blue-800 hover:underline leading-tight block mb-2">{story.subject}</a>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {story.tags.map((tag, tagIndex) => (
                                                        <span key={tagIndex} className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: tag[1] }}>
                                                            {tag[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-gray-700 text-lg">
                                                {story.total_points ?? story.point ?? 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={story.is_closed ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-none' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none'}>
                                                    {story.is_closed ? 'Closed' : 'Open'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {story.status_extra_info && story.status_extra_info.name ? (
                                                    <Badge variant={"outline"} className="bg-white/60 shadow-sm" style={{ borderColor: story.status_extra_info.color, color: story.status_extra_info.color }}>
                                                        {story.status_extra_info.name}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant={"outline"} className="bg-gray-100 text-gray-500">
                                                        Unknown
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {(!userStories || userStories.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <FileX className="w-12 h-12 text-gray-300" />
                                                <p>No user stories found in this sprint.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

export default ProjectScrumDetail;