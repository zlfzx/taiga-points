import { Link, Outlet, useLoaderData, useLocation } from "react-router";
import type { Project as ProjectModel } from "@/models/project";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WindowContent, WindowHeader, WindowLayout } from "@/components/window-layout";

function Project() {
    const project = useLoaderData<ProjectModel>();
    const location = useLocation();

    // Helper function to check if the current path matches the tab
    const isActive = (pathSuffix: string) => {
        if (pathSuffix === '') {
            // Member tab is the index, so it matches when there is no suffix (exact match with base slug)
            return location.pathname.endsWith(`/project/${project.slug}`) || location.pathname.endsWith(`/project/${project.slug}/`);
        }
        return location.pathname.includes(`/project/${project.slug}/${pathSuffix}`);
    };

    return (
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-12 min-h-screen">
            <WindowLayout>
                <WindowHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center">
                            <Link to="/projects" className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                                    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                            </Link>
                            <Separator orientation="vertical" className="mx-4 h-8" />
                            <div className="flex-1">
                                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">{project.name}</h1>
                                <p className="text-muted-foreground text-lg">{project.description}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant={isActive('') ? "default" : "secondary"} className={`transition-colors duration-200 me-3 ${isActive('') ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/60 hover:bg-white text-slate-700'}`}>
                                <Link to={`/project/${project.slug}`} className="flex items-center justify-center w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                    Members
                                </Link>
                            </Button>
                            <Button variant={isActive('scrum') ? "default" : "secondary"} className={`transition-colors duration-200 ${isActive('scrum') ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/60 hover:bg-white text-slate-700'}`}>
                                <Link to={`/project/${project.slug}/scrum`} className="flex items-center justify-center w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                                    </svg>
                                    Scrum Report
                                </Link>
                            </Button>
                            <Button variant={isActive('settings') ? "default" : "secondary"} className={`transition-colors duration-200 ${isActive('settings') ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/60 hover:bg-white text-slate-700'}`}>
                                <Link to={`/project/${project.slug}/settings`} className="flex items-center justify-center w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </WindowHeader>

                <WindowContent>
                    <Outlet />
                </WindowContent>
            </WindowLayout>
        </div>
    );
}

export default Project;