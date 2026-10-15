import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import api from "@/lib/axios";
import type { Project } from "@/models/project";
import type { UserStoryCustomAttribute } from "@/models/user_story"
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
    const [userStoryCustomAttributeFilter, setUserStoryCustomAttributeFilter] = useState<string>('');
    const [selectedCustomAttribute, setSelectedCustomAttribute] = useState<UserStoryCustomAttribute | null>(null);
    const [hasSettingPermission, setHasSettingPermission] = useState<boolean>(false);
    const revalidator = useRevalidator();

    const { data: projectSetting, isLoading } = useSWR<Project>(project ? `/api/project?slug=${project.slug}` : null, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
    });

    const { data: userStoryCustomAttributes } = useSWR<UserStoryCustomAttribute[]>(project ? `/api/user-story-custom-attributes?project=${project.id}` : null, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data)
    })

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
            user_story_custom_attribute_filter: userStoryCustomAttributeFilter
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
            setUserStoryCustomAttributeFilter(projectSetting.user_story_custom_attribute_filter || '')
        }

        if (project && project.i_am_admin || project && project.i_am_owner) {
            setHasSettingPermission(true);
        }
    }, [projectSetting, project]);

    useEffect(() => {
        if (userStoryCustomAttributes) {
            const customAttribute = userStoryCustomAttributes.find(attr => attr.id.toString() === userStoryCustomAttributeFilter);
            if (customAttribute) {
                setSelectedCustomAttribute(customAttribute);
            } else {
                setSelectedCustomAttribute(null);
            }
        }
    }, [userStoryCustomAttributeFilter, userStoryCustomAttributes]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-4" />
            </div>
        );
    }

    return (
        <div className="pb-10">
            <h3 className="scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1 mb-6 mt-2">
                Project Settings
            </h3>

            <div className="flex flex-col items-start gap-8 bg-white/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/60 shadow-sm w-full">
                <div className="flex flex-col gap-3 w-full border-b border-gray-200/50 pb-8">
                    <Label className="text-base font-semibold text-gray-800">Max Story Point</Label>
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

                <div className="flex flex-col gap-3 w-full border-b border-gray-200/50 pb-8">
                    <Label className="text-base font-semibold text-gray-800">Roles for Story Point Calculation</Label>
                    <p className="text-sm text-muted-foreground -mt-2 mb-2">
                        Choose which roles should count toward the total story points per member.
                    </p>
                    <div className="flex flex-row flex-wrap gap-2 w-full max-w-3xl">
                        {project && project.roles && project.roles.map((role, index) => (
                            <Toggle
                                key={index}
                                className={`bg-white/60 hover:bg-white border border-gray-200 cursor-pointer data-[state=on]:bg-blue-50 data-[state=on]:border-blue-300 data-[state=on]:text-blue-700 data-[state=on]:shadow-sm transition-all duration-200 disabled:opacity-50`}
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
                </div>

                <div className="flex flex-col gap-3 w-full pb-4">
                    <Label className="text-base font-semibold text-gray-800">Statuses for Story Point Calculation</Label>
                    <p className="text-sm text-muted-foreground -mt-2 mb-2">
                        Choose which statuses should count toward the total story points per member.
                    </p>
                    <div className="flex flex-row flex-wrap gap-3 w-full max-w-3xl">
                        {project && project.us_statuses && project.us_statuses.map((status, index) => (
                            <Toggle
                                key={index}
                                className={`bg-white/60 hover:bg-white border border-gray-200 cursor-pointer data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all duration-200 disabled:opacity-50 rounded-full px-4`}
                                style={statusPoints.includes(status.id) ? { color: status.color, borderColor: status.color, backgroundColor: `${status.color}15` } : { color: status.color }}
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
                </div>

                <div className="flex flex-col gap-3 w-full pb-4">
                    <Label className="text-base font-semibold text-gray-800">Custom Filter for Member User Stories</Label>
                    <p className="text-sm text-muted-foreground -mt-2 mb-2">
                        Choose which custom field should be used to filter the user stories for each member. This allows you to customize how user stories are assigned and tracked based on specific criteria.
                    </p>
                    <div className="flex flex-row gap-8">
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium text-gray-700">Select Custom Attribute</Label>
                            <Select onValueChange={(value) => setUserStoryCustomAttributeFilter(value)} value={userStoryCustomAttributeFilter}>
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="Select Custom Attribute" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {userStoryCustomAttributes && userStoryCustomAttributes.length > 0 ? (
                                            userStoryCustomAttributes.map((attribute) => (
                                                <SelectItem key={attribute.id} value={attribute.id.toString()}>
                                                    {attribute.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No custom attributes found</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            {selectedCustomAttribute && selectedCustomAttribute.type === 'dropdown' && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Dropdown Values</Label>
                                    <div className="mt-4">
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedCustomAttribute.extra && selectedCustomAttribute.extra.length > 0 ? (
                                                selectedCustomAttribute.extra.map((value, index) => (
                                                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                                        {value}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No dropdown values available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {hasSettingPermission && (
                    <div className="pt-2 w-full">
                        <Button
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-colors duration-300 px-8 py-6 rounded-xl text-md font-semibold"
                            onClick={saveSettings}
                        >
                            Save Settings
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectSetting;