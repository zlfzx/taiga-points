import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import api from "@/lib/axios";
import type { Project } from "@/models/project";
import { useEffect, useState } from "react";
import { useRevalidator, useRouteLoaderData } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";


function ProjectSetting() {

    const projectData = useRouteLoaderData<Project>('project');
    const [project] = useState<Project | null>(projectData || null);
    const [maxPoint, setMaxPoint] = useState<number>(0);
    const [rolePoints, setRolePoints] = useState<number[]>([]);
    const [statusPoints, setStatusPoints] = useState<number[]>([]);
    const [hasSettingPermission, setHasSettingPermission] = useState<boolean>(false);
    const revalidator = useRevalidator();

    const { data: projectSetting, isLoading } = useSWR(project ? `/api/project?slug=${project.slug}` : null, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
    });

    const saveSettings = async () => {
        if (!project) {
            // Optionally handle the error, e.g., show a message or return early
            return;
        }

        const payload = {
            slug: project.slug,
            max_points: maxPoint,
            role_points: rolePoints.join(','),
            status_points: statusPoints.join(','),
        };

        try {
            const response = await api.post('/api/project/settings', payload);
            if (response.status === 200) {
                console.log("Settings saved successfully:", response.data);
                // Optionally, you can show a success message or update the UI

                // Revalidate the data from loader to reflect the changes
                revalidator.revalidate();

                toast.success("Settings saved successfully!", {
                    duration: 2000,
                })
            }

        } catch (error) {
            console.error("Error saving settings:", error);
            // Optionally, handle the error, e.g., show an error message

            toast.error("Failed to save settings. Please try again.", {
                duration: 2000,
            });
        }
    }

    useEffect(() => {
        if (projectSetting) {
            setMaxPoint(projectSetting.max_points || 0);
            setRolePoints(projectSetting.role_points ? projectSetting.role_points.map(Number) : []);
            setStatusPoints(projectSetting.status_points ? projectSetting.status_points.map(Number) : []);
        }

        if (project && project.i_am_admin || project && project.i_am_owner) {
            setHasSettingPermission(true);
        }
    }, [projectSetting, project]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-4" />
            </div>
        );
    }

    return (
        <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                Project Settings
            </h3>

            <div className="flex flex-col items-start gap-6">
                <div className="flex flex-col gap-2">
                    <Label>Max Story Point:</Label>
                    <Input
                        id="maxPoint"
                        name="maxPoint"
                        type="number"
                        min={0}
                        value={maxPoint}
                        className="w-56 bg-white/60 backdrop-blur-md focus-visible:ring-0"
                        onChange={(e) => setMaxPoint(Number(e.target.value))}
                        placeholder="Enter max story point"
                        readOnly={!hasSettingPermission}
                    />
                    <p className="text-xs text-muted-foreground">
                        This is the maximum story points that can be assigned per member in each sprint.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Select Roles for Story Point Calculation:</Label>
                    <div className="flex flex-row flex-wrap gap-2 w-2/4">
                        {project && project.roles && project.roles.map((role, index) => (
                            <Toggle
                                key={index}
                                className={`bg-accent/50 hover:bg-accent/80 border-transparent cursor-pointer data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-gray-500 data-[state=on]:font-boldx disabled:opacity-80`}
                                variant={"outline"}
                                pressed={rolePoints.includes(role.id)}
                                onPressedChange={(checked) => {
                                    if (checked) {
                                        setRolePoints((prev) => [...prev, role.id]);
                                    } else {
                                        setRolePoints((prev) => prev.filter(r => r !== role.id));
                                    }
                                }}
                                disabled={!hasSettingPermission}
                            >
                                {role.name}
                            </Toggle>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Choose which roles should count toward the total story points per member.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Select Statuses for Story Point Calculation:</Label>
                    <div className="flex flex-row flex-wrap gap-2 w-2/4">
                        {project && project.us_statuses && project.us_statuses.map((status, index) => (
                            <Toggle
                                key={index}
                                className={`bg-accent/50 hover:bg-accent/80 border-transparent cursor-pointer data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-gray-500 data-[state=on]:font-boldx disabled:opacity-80`}
                                style={{ color: status.color }}
                                variant={"outline"}
                                pressed={statusPoints.includes(status.id)}
                                onPressedChange={(checked) => {
                                    if (checked) {
                                        setStatusPoints((prev) => [...prev, status.id]);
                                    } else {
                                        setStatusPoints((prev) => prev.filter(s => s !== status.id));
                                    }
                                }}
                                disabled={!hasSettingPermission}
                            >
                                {status.name}
                            </Toggle>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Choose which statuses should count toward the total story points per member.
                    </p>
                </div>

                { hasSettingPermission && (
                    <Button
                        className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-foreground transition-colors duration-200"
                        onClick={saveSettings}
                    >
                        Save Settings
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ProjectSetting;