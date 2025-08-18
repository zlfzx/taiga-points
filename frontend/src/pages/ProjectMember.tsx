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
import { Badge } from "@/components/ui/badge";
import { useRouteLoaderData } from "react-router";
import type { Project } from "@/models/project";
import useSWR from "swr";
import { Toggle } from "@/components/ui/toggle";

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

    const { data: member } = useMemberDetail(selectedMemberId ?? undefined)

    const detailMember = (memberId: number) => {
        setOpenModalMember(true);
        setSelectedMemberId(memberId); // trigger fetch by setting ID
    };

    // Filter members by search (full name) and selected roles
    const filteredMembers = (members ?? []).filter(member => {
        const matchesName = member.full_name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(member.role_name);
        return matchesName && matchesRole;
    });

    return (
        <>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                List of Members
            </h3>
            <Input
                className="bg-white/60 backdrop-blur-md focus-visible:ring-0 shadow-none border-transparent"
                placeholder="Search..."
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-row flex-wrap items-start gap-3 text-sm mt-4">
                {project && project.roles.map((role, index) => (
                    <div key={role.id || index} className="flex items-center gap-1">
                        <Toggle
                            variant={"outline"}
                            size={"sm"}
                            className={`bg-accent/50 hover:bg-accent/80 border-transparent text-gray-500 cursor-pointer hover:text-gray-600 data-[state=on]:text-gray-600 data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-gray-400 data-[state=on]:shadow-lgx`}
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
                    </div>
                ))}
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
                        filteredMembers.map((member, index) => (
                            <Card key={member.id || index} className="justify-center transition-all duration-100 hover:shadow-md hover:bg-white/60 bg-white/40 backdrop-blur-md border-transparent shadow-white">
                                <CardContent className="flex flex-col items-center justify-center">
                                    <Avatar className="w-24 h-24 mb-3 border-4 border-white/50 shadow-lg">
                                        <AvatarImage src={member.photo ? member.photo : userImg} />
                                    </Avatar>
                                    <h3 className="text-lg font-semibold text-center">{member.full_name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.role_name}</p>
                                    <Button variant="secondary" size="sm" onClick={() => detailMember(member.id)} className="bg-white cursor-pointer mt-3 hover:bg-white/60">Detail</Button>
                                </CardContent>
                            </Card>
                        ))
                    )
                )}
            </div>

            <Dialog open={openModalMember} onOpenChange={setOpenModalMember}>
                <DialogContent className="sm:max-w-7xl max-w-full bg-white/70 backdrop-blur-md" aria-describedby={undefined}>
                    <DialogHeader>
                        {member ? (
                            <div className="flex flex-row items-end justify-between">
                                <div className="flex flex-row items-center gap-2">
                                    <Avatar className="w-12 h-12 border-4 border-white/50 shadow-lg">
                                        <AvatarImage src={member.photo ? member.photo : userImg} />
                                    </Avatar>
                                    <div>
                                        <DialogTitle>{member?.full_name}</DialogTitle>
                                        <DialogDescription>{member?.role_name}</DialogDescription>
                                    </div>
                                </div>
                                {project && project.role_points && (
                                    project.role_points.length === 0 ||
                                    (member?.role !== undefined && project.role_points.includes(member.role))
                                ) && (
                                        <div className="flex flex-row items-center">
                                            <p>Total Point : <span className="font-bold">{member?.total_point}</span></p>
                                            <p className="mx-2">🤝</p>
                                            <p>Remaining Point : <span className="font-bold">{member?.remaining_point}</span></p>
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
                                    {project && project.role_points && (
                                        project.role_points.length === 0 ||
                                        (member?.role !== undefined && project.role_points.includes(member.role))
                                    ) && (
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
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="text-wrap whitespace-break-spaces">
                                                {swimlane && <><b className="text-gray-700">{swimlane}</b></>} <small className="text-gray-600">{story.milestone_name}</small>
                                                <br />
                                                <a href={story.url} target="_blank">{story.subject}</a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={"secondary"} className="bg-white" style={{ color: story.status_extra_info.color }}>{story.status_extra_info.name}</Badge>
                                            </TableCell>
                                            {project && project.role_points && (
                                                project.role_points.length === 0 ||
                                                (member?.role !== undefined && project.role_points.includes(member.role))
                                            ) && (
                                                    <TableCell className={ project.status_points.includes(story.status) ? "text-center font-bold" : "text-muted-foreground text-center"}>{story.point}</TableCell>
                                                )}
                                        </TableRow>
                                    )
                                })}
                                {member && member.stories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={project && project.role_points && (project.role_points.length === 0 || (member?.role !== undefined && project.role_points.includes(member.role))) ? 4 : 3} className="text-center text-muted-foreground py-10">
                                            No stories found for this member.
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
                            {project && project.role_points && (
                                project.role_points.length === 0 ||
                                (member?.role !== undefined && project.role_points.includes(member.role))
                            ) && (
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