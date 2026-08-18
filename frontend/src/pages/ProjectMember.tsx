import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import type { Member } from "@/models/member";
import { useState } from "react";
import userImg from "@/assets/user.png";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ghost, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouteLoaderData } from "react-router";
import type { Project } from "@/models/project";
import useSWR from "swr";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Custom hook to fetch member details with SWR
const useMemberDetail = (memberId?: number) => {
    return useSWR<Member>(
        memberId ? `/api/member/${memberId}` : null,
        {
            fetcher: (url: string) => api.get(url).then(res => res.data.data),
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    )
}

function ProjectMember() {
    const project = useRouteLoaderData<Project>('project');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [openModalMember, setOpenModalMember] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const { data: members, isLoading: isLoadMembers } = useSWR<Member[]>(project ? `/api/members?project=${project.id}` : null, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
    });



    const { data: member } = useMemberDetail(selectedMemberId ?? undefined)

    const detailMember = (memberId: number) => {
        setOpenModalMember(true);
        setSelectedMemberId(memberId); // trigger fetch by setting ID
    };

    const filteredMembers = (members ?? []).filter(member => {
        const matchesName = member.full_name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(member.role_name);
        return matchesName && matchesRole;
    });

    const showPoints = project && project.role_points && (
        project.role_points.length === 0 ||
        (member?.role !== undefined && project.role_points.includes(member.role))
    );

    return (
        <>
            <h3 className="scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1 mb-2">
                List of Members
            </h3>
            <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
                <div className="relative w-full md:w-1/3 lg:w-1/4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        className="bg-white/60 backdrop-blur-md focus-visible:ring-0 shadow-sm border-white/40 pl-9"
                        placeholder="Search members..."
                        autoComplete="off"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex-1 max-w-full overflow-hidden">
                    <ScrollArea className="w-full whitespace-nowrap rounded-md">
                        <div className="flex w-max space-x-2 pb-2">
                            {project && project.roles.map((role, index) => (
                                <Toggle
                                    key={role.id || index}
                                    variant={"outline"}
                                    size={"sm"}
                                    className="bg-white/40 hover:bg-white/80 border-white/40 text-gray-600 cursor-pointer data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500 transition-colors shadow-sm shrink-0"
                                    pressed={selectedRoles.includes(role.name)}
                                    onPressedChange={() => {
                                        setSelectedRoles((prev) =>
                                            prev.includes(role.name)
                                                ? prev.filter((r) => r !== role.name)
                                                : [...prev, role.name]
                                        );
                                    }}
                                >
                                    {role.name}
                                </Toggle>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="h-1.5" />
                    </ScrollArea>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
                {isLoadMembers ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-60 w-full bg-white/40" />
                    ))
                ) : (
                    filteredMembers.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-10">No members found.</div>
                    ) : (
                        filteredMembers.map((member: Member, index: number) => (
                            <Card key={member.id || index} className="cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10" onClick={() => detailMember(member.id)}>
                                <CardContent className="flex flex-row items-center justify-between p-5 gap-3">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <Avatar className="w-14 h-14 border-2 border-white/50 shadow-sm shrink-0">
                                            <AvatarImage src={member.photo ? member.photo : userImg} />
                                        </Avatar>
                                        <div className="flex flex-col text-left min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 leading-tight truncate" title={member.full_name}>{member.full_name}</h3>
                                            <p className="text-sm text-blue-600 font-medium mt-1 truncate" title={member.role_name}>{member.role_name}</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="icon" className="bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-full transition-colors hidden sm:flex shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )
                )}
            </div>

            <Dialog open={openModalMember} onOpenChange={setOpenModalMember}>
                <DialogContent className="sm:max-w-7xl max-w-full bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                        {member ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pr-8 gap-4 sm:gap-0">
                                <div className="flex flex-row items-center gap-3">
                                    <Avatar className="w-12 h-12 border-4 border-white/50 shadow-lg">
                                        <AvatarImage src={member.photo ? member.photo : userImg} />
                                    </Avatar>
                                    <div>
                                        <DialogTitle>{member?.full_name}</DialogTitle>
                                        <DialogDescription>{member?.role_name}</DialogDescription>
                                    </div>
                                </div>
                                {showPoints && (
                                        <div className="flex flex-row items-center gap-3">
                                            <div className="flex flex-col items-end bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Total Points</span>
                                                <span className="text-lg font-extrabold text-blue-900 leading-none">{member?.total_point}</span>
                                            </div>
                                            <div className="flex flex-col items-end bg-amber-50/80 border border-amber-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Remaining</span>
                                                <span className="text-lg font-extrabold text-amber-900 leading-none">{member?.remaining_point}</span>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <>
                                <DialogTitle className="sr-only">Loading...</DialogTitle>
                                <Skeleton className="h-6 w-1/4 bg-gray-400" />
                                <Skeleton className="h-6 w-1/6 bg-gray-300 mt-2" />
                            </>
                        )}
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[80vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>User Story</TableHead>
                                    <TableHead>Status</TableHead>
                                    {showPoints && (
                                            <TableHead className="text-center">Story Point</TableHead>
                                        )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {member && Array.isArray(member.stories) && member.stories.map((story, index) => {
                                    // let status = "";
                                    // let statusColor = "";
                                    // if (project && project.us_statuses && Array.isArray(project.us_statuses)) {
                                    //     project.us_statuses.forEach((us_status) => {
                                    //         if (story.status == us_status.id) {
                                    //             status = us_status.name;
                                    //             statusColor = us_status.color;
                                    //         }
                                    //     });
                                    // }

                                    let swimlane = "";
                                    if (project && project.swimlanes && Array.isArray(project.swimlanes)) {
                                        project.swimlanes.forEach((swimlaneData) => {
                                            if (story.swimlane == swimlaneData.id) {
                                                swimlane = swimlaneData.name;
                                            }
                                        });
                                    }

                                    // const pointID = story.points[member.role]
                                    // let sp = "0";
                                    // if (pointID && project && Array.isArray(project.points)) {
                                    //     project.points.forEach((point) => {
                                    //         if (point.id == pointID) {
                                    //             sp = point.name;
                                    //         }
                                    //     });
                                    // }

                                    return (
                                        <TableRow key={story.id || index}>
                                            <TableCell className="font-medium text-gray-500">{story.ref ? `#${story.ref}` : index + 1}</TableCell>
                                            <TableCell className="text-wrap whitespace-break-spaces py-3">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    {swimlane && (
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-semibold px-2 py-0">
                                                            {swimlane}
                                                        </Badge>
                                                    )}
                                                    {story.milestone_name && (
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200/60">
                                                            {story.milestone_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <a href={story.url} target="_blank" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">{story.subject}</a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={"outline"} className="bg-white/60 shadow-sm" style={{ borderColor: story.status_extra_info.color, color: story.status_extra_info.color }}>
                                                    {story.status_extra_info.name}
                                                </Badge>
                                            </TableCell>
                                            {showPoints && (
                                                    <TableCell className={ project.status_points.includes(story.status) ? "text-center font-bold" : "text-muted-foreground text-center"}>{story.point}</TableCell>
                                                )}
                                        </TableRow>
                                    )
                                })}
                                {member && member.stories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={showPoints ? 4 : 3} className="text-center text-muted-foreground py-12">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Ghost className="w-12 h-12 text-gray-300" />
                                                <p>No user stories assigned to this member yet.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!member && (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className="h-6 w-8 bg-gray-300" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className={`h-6 ${i === 0 ? "w-80" : i === 1 ? "w-72" : "w-96"} bg-gray-300`} />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className={`h-6 ${i === 0 ? "w-32" : i === 1 ? "w-20" : "w-40"} bg-gray-300`} />
                                            </TableCell>
                                            <TableCell className="flex justify-center">
                                                <Skeleton className="h-6 w-12 bg-gray-300" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            {showPoints && (
                                    <TableFooter>
                                        <TableRow>
                                            <TableHead colSpan={3} className="text-right">Total Story Point</TableHead>
                                            <TableHead className="font-bold text-center">{member?.total_point || "0"}</TableHead>
                                        </TableRow>
                                    </TableFooter>
                                )}
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ProjectMember;