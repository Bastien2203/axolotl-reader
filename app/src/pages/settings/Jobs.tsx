import { useNavigate } from "react-router-dom";
import PageLayout from "../../layout/PageLayout"
import { Job, JobState } from "../../types";
import { useEffect, useState } from "react";
import { getJobs } from "../../services/Job";
import { useToast } from "../../contexts/ToastContext";
import Spinner from "../../components/common/Spinner";
import {  CircleAlert, CircleCheck, CircleX, PauseCircle, PlayCircle } from "lucide-react";


const Jobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>();
    const { showToast } = useToast();

    useEffect(() => {
        getJobs().then((data) => {
            setJobs(data);
        }
        ).catch((error) => {
            console.error(error);
            showToast({
                message: "Error getting jobs",
                type: "alert-error"
            })
        })

    }, [])




    return <PageLayout title="Jobs" onBack={() => navigate("/settings")}>
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Job Name</th>
                    <th>State</th>
                    <th>Created At</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                {jobs?.map((job,i) => (
                    <tr key={i}>
                        <td>{job.name}</td>
                        <td>
                            <JobStateIcon state={job.state} />
                        </td>
                        <td>{new Date(job.created_at).toLocaleString()}</td>
                        <td>{job.duration}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {jobs?.length === 0 && (
            <div className="alert">
                <div>
                    <span>No jobs found</span>
                </div>
            </div>
        )}
        {jobs?.length === undefined && (
            <div className="w-full h-full flex justify-center items-center">
                <Spinner />
            </div>
        )}

    </PageLayout>
}

export default Jobs


const JobStateIcon = ({ state }: { state: JobState }) => {
    switch (state) {
        case "Pending":
            return <PauseCircle size={30} color="#FBBF24" /> // amber-400
        case "Running":
            return <PlayCircle size={30} color="#3B82F6" /> // blue-500
        case "Completed":
            return <CircleCheck size={30} color="#10B981" /> // green-500
        case "Failed":
            return <CircleX size={30} color="#EF4444" /> // red-500
        default:
            return <CircleAlert size={30} color="#F87171" /> // red-400
    }
}
