import type { LoaderFunctionArgs } from "react-router";
import type { Project } from "../models/project";
import api from "@/lib/axios";

export async function projectsLoader(): Promise<Project[]> {
  // get projects from the backend
  let url = '/api/projects';

  const getUser = localStorage.getItem('user');
  const user: { id?: string } = JSON.parse(getUser || '{}');
  if (user.id) {
    url += `?member=${user.id}`;
  }

  const response = await api.get<{ data: Project[] }>(url);
  const projects = response.data.data;

  return projects;
}


export async function projectLoader(args: LoaderFunctionArgs): Promise<Project> {
    const params = args.params as { slug: string };

    // get project from the backend
    const responseProject = await api.get<{ data: Project }>(`/api/project`, {
        params: {
            slug: params.slug,
        },
    }).catch((error) => {
        console.error("Error fetching project:", error);
        throw new Error("Failed to fetch project");
    });

    console.log("Project loaded:", responseProject.data.data);

    return responseProject.data.data;
}

// export { projectsLoader, projectLoader };