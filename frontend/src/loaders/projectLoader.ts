import axios from "axios";
import type { LoaderFunctionArgs } from "react-router";
import type { Project } from "../models/project";

export async function projectsLoader(): Promise<{ projects: Project[] }> {
  // get projects from the backend
  let url = '/api/projects';
  const getUser = localStorage.getItem('user');
  const user: { id?: string } = JSON.parse(getUser || '{}');
  if (user.id) {
    url += `?member=${user.id}`;
  }
  const response = await axios.get<{ data: Project[] }>(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const projects = response.data.data;

  return { projects };
}


export async function projectLoader(args: LoaderFunctionArgs): Promise<{ project: Project }> {
    const params = args.params as { slug: string };

    // get project from the backend
    const responseProject = await axios.get(`/api/project`, {
        headers: {
            "Content-Type": "application/json",
        },
        params: {
            slug: params.slug,
        },
    }).catch((error) => {
        console.error("Error fetching project:", error);
        throw new Error("Failed to fetch project");
    });

    const project = responseProject.data.data;

    return { project };
}

// export { projectsLoader, projectLoader };