import { Link, useLoaderData } from "react-router";
import type { Project } from "../models/project";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { WindowContent, WindowHeader, WindowLayout } from "@/components/window-layout";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import projectImg from "../assets/project.png";
import { useState } from "react";
import { useLogout } from "@/auth/auth";

function Projects() {
    const { projects } = useLoaderData<{ projects: Project[] }>();
    const [user] = useState(() => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    });
    const logout = useLogout();

    console.log("Projects:", projects);

    return (
        <div className="container mx-auto p-6">
            <WindowLayout>
                <WindowHeader>
                    <div className="flex flex-wrap">
                        <div className="flex items-center justify-center me-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <div className="flex-3">
                            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">{user.full_name || user.username}</h1>
                            <p className="text-muted-foreground text-lg">{user.email}</p>
                        </div>
                        <div className="flex-1 flex items-center justify-end">
                            <Button variant="secondary" className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 hover:text-gray-900 transition-colors duration-200 cursor-pointer" onClick={logout}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                </svg>
                                Logout
                            </Button>
                        </div>
                    </div>
                </WindowHeader>
                <WindowContent>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                        List of Projects
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 mt-5">
                        {projects.map((item, index) => (
                            <Card key={index} className="justify-between transition-all duration-100 hover:shadow-xl hover:bg-white/50 hover:border-white/30 bg-white/40 backdrop-blur-md">
                                <CardHeader className="flex flex-col items-center justify-center">
                                    <Avatar className="w-24 h-24 rounded mb-3">
                                        <AvatarImage src={item.logo_big_url ? item.logo_big_url : projectImg} />
                                    </Avatar>
                                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {item.name}
                                    </CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="secondary" className="w-full bg-white">
                                        <Link to={`/project/${item.slug}`} className="w-full">
                                            Details
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </WindowContent>
            </WindowLayout>
        </div>
    );
}

export default Projects;