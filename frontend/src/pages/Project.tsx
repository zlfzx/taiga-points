import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Member } from "../models/member";
import type { Project as ProjectModel } from "../models/project";
import userImg from "../assets/user.png";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { WindowContent, WindowHeader, WindowLayout } from "@/components/window-layout";

function Project() {
    const { project } = useLoaderData<{ project: ProjectModel }>();
    const [isLoadMembers, setIsLoadMembers] = useState<boolean>(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [modalMember, setModalMember] = useState<Member | null>(null);
    const [search, setSearch] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // Filter members by search (full name) and selected roles
    const filteredMembers = members.filter(member => {
        const matchesName = member.full_name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(member.role_name);
        return matchesName && matchesRole;
    });

    useEffect(() => {
        const getMembers = async () => {
            setIsLoadMembers(true);
            try {
                const response = await axios.get<{ data: Member[] }>("/api/members", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    params: {
                        project: project.id,
                    },
                });
                setMembers(response.data.data);
                setModalMember(null);
                setIsLoadMembers(false);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        console.log("project", project);

        getMembers();
    }, [project]);

    return (
        <>
            <div className="container mx-auto p-6">
                <WindowLayout>
                    <WindowHeader>
                        <div className="flex flex-wrap">
                            <div className="flex items-center justify-center">
                                <Link to="/projects" className="w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5" />
                                    </svg>


                                </Link>
                                <Separator orientation="vertical" className="mx-2" />
                            </div>
                            <div className="flex-3">
                                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">{project.name}</h1>
                                <p className="text-muted-foreground text-lg">{project.description}</p>
                            </div>
                            <div className="flex-1 flex items-center justify-end">
                                <Button variant="secondary" className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 hover:text-gray-900 transition-colors duration-200">
                                    <Link to={`/project/${project.slug}/scrum`} className="flex items-center justify-center w-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                                        </svg>
                                        Scrum Report
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </WindowHeader>

                    <WindowContent>
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                            List of Members
                        </h3>
                        <Input
                            className="bg-white/60 backdrop-blur-md focus-visible:ring-0"
                            placeholder="Search..."
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex flex-row flex-wrap items-start gap-3 text-sm mt-4">
                            {project.roles.map((role, index) => (
                                <div key={role.id || index} className="flex items-center gap-1">
                                    <Checkbox
                                        id={role.slug}
                                        className="bg-white/60 backdrop-blur-md"
                                        checked={selectedRoles.includes(role.name)}
                                        onCheckedChange={() => {
                                            setSelectedRoles((prev) =>
                                                prev.includes(role.name)
                                                    ? prev.filter((r) => r !== role.name)
                                                    : [...prev, role.name]
                                            );
                                        }}
                                    />
                                    <Label htmlFor={role.slug}>{role.name}</Label>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
                            {isLoadMembers ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-60 w-full bg-white/40" />
                                ))
                            ) : (
                                filteredMembers.length === 0 ? (
                                    <div className="col-span-full text-center text-muted-foreground py-10">No members found.</div>
                                ) : (
                                    filteredMembers.map((member, index) => (
                                        <Card key={member.id || index} className="transition-all duration-100 hover:shadow-xl hover:bg-white/50 hover:border-white/30 bg-white/40 backdrop-blur-md">
                                            <CardContent className="flex flex-col items-center">
                                                <Avatar className="w-24 h-24 mb-3">
                                                    <AvatarImage src={member.photo ? member.photo : userImg} />
                                                </Avatar>
                                                <h3 className="text-lg font-semibold">{member.full_name}</h3>
                                                <p className="text-sm text-muted-foreground">{member.role_name}</p>
                                                <Button variant="secondary" size="sm" onClick={() => setModalMember(member)} className="bg-white cursor-pointer mt-3">Detail</Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                )
                            )}
                        </div>
                    </WindowContent>
                </WindowLayout>
            </div>


            <Dialog open={!!modalMember} onOpenChange={(open) => {
                if (!open) {
                    setModalMember(null);
                }
            }}>
                <DialogContent className="sm:max-w-7xl max-w-full bg-white/80 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle>{modalMember?.full_name}</DialogTitle>
                        <DialogDescription>{modalMember?.role_name}</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[80vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Story</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Story Point</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modalMember && modalMember.stories.map((story, index) => {
                                    let status = "";
                                    let statusColor = "";
                                    if (project.us_statuses && Array.isArray(project.us_statuses)) {
                                        project.us_statuses.forEach((us_status) => {
                                            if (story.status == us_status.id) {
                                                status = us_status.name;
                                                statusColor = us_status.color;
                                            }
                                        });
                                    }

                                    let swimlane = "";
                                    if (project.swimlanes && Array.isArray(project.swimlanes)) {
                                        project.swimlanes.forEach((swimlaneData) => {
                                            if (story.swimlane == swimlaneData.id) {
                                                swimlane = swimlaneData.name;
                                            }
                                        });
                                    }

                                    const pointID = story.points[modalMember.role]
                                    let sp = "0";
                                    if (pointID && Array.isArray(project.points)) {
                                        project.points.forEach((point) => {
                                            if (point.id == pointID) {
                                                sp = point.name;
                                            }
                                        });
                                    }

                                    return (
                                        <TableRow key={story.id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="text-wrap">
                                                <b>[{swimlane}]</b> {story.subject}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={"secondary"} className="bg-white" style={{ color: statusColor }}>{status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{sp}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableHead colSpan={3} className="text-right">Total Story Point</TableHead>
                                    <TableHead className="text-center">{modalMember?.total_point}</TableHead>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default Project;