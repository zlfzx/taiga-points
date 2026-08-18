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
    const projects = useLoaderData<Project[]>();
    const [user] = useState(() => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    });
    const logout = useLogout();


    return (
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-12 min-h-screen">
            <WindowLayout>
                <WindowHeader>
                    <div className="flex flex-wrap">
                        <div className="flex items-center justify-center me-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <div className="flex-3">
                            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-balance">{user.full_name || user.username}</h1>
                            <p className="text-muted-foreground text-lg">{user.email}</p>
                        </div>
                        <div className="flex-1 flex items-center justify-end">
                            <Button variant="secondary" className="bg-white/60 hover:bg-red-500 hover:text-white text-slate-700 transition-colors duration-200 cursor-pointer" onClick={logout}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                </svg>
                                Logout
                            </Button>
                        </div>
                    </div>
                </WindowHeader>
                <WindowContent>
                    <h3 className="scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1 mb-2 mt-2">
                        List of Projects
                    </h3>
                    <div className="flex flex-wrap justify-center gap-8 mt-8">
                        {projects.map((item, index) => (
                            <Card key={index} className="flex flex-col justify-between w-full max-w-[350px] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 hover:bg-white hover:border-white/80 bg-white/80 backdrop-blur-md border-white/40 shadow-sm shadow-blue-900/10">
                                <CardHeader className="flex flex-col items-center justify-center text-center">
                                    <Avatar className="w-28 h-28 rounded-xl shadow-md border border-white/50 mb-4">
                                        <AvatarImage src={item.logo_big_url ? item.logo_big_url : projectImg} />
                                    </Avatar>
                                    <CardTitle className="text-2xl font-semibold tabular-nums">
                                        {item.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 mt-2">{item.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-4">
                                    <Button variant="secondary" className="w-full bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg transition-colors duration-200">
                                        <Link to={`/project/${item.slug}`} className="flex items-center justify-center w-full">
                                            Buka Dashboard
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