import api from "@/lib/axios";
import { useParams } from "react-router";
import useSWR from "swr";


function ProjectScrumDetail() {

    const milestoneId = useParams().milestoneId;

    const { data: milestone, error, isLoading } = useSWR(`/api/milestone/${milestoneId}`, {
        fetcher: (url: string) => api.get(url).then(res => res.data.data),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    if (error) return <p>Failed to load milestone details.</p>;
    if (isLoading) return <p>Loading milestone details...</p>;

    console.log("Milestone loaded:", milestone);

    return (
        <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                {milestone.name}
            </h3>
            {/* Additional content can be added here */}

        </div>
    );
}

export default ProjectScrumDetail;