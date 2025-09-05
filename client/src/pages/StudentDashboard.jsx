import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import ApplicationCard from "../components/ApplicationCard";
import FilterPanel from "../components/FilterPanel";
import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [searchTerm, filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications/my-applications");
      setApplications(response.data.applications);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowApplyModal(true);
    }
  };

  const submitApplication = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      await api.post(`/jobs/${selectedJob._id}/apply`, {
        cover_letter: coverLetter,
      });

      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setCoverLetter("");
      setSelectedJob(null);
      fetchApplications();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setApplying(false);
    }
  };

  const appliedJobIds = applications.map((app) => app.job_id._id);
  const availableJobs = jobs.filter((job) => !appliedJobIds.includes(job._id));

  const stats = {
    totalApplications: applications.length,
    shortlisted: applications.filter((app) => app.status === "shortlisted")
      .length,
    hired: applications.filter((app) => app.status === "hired").length,
    pending: applications.filter((app) => app.status === "applied").length,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Find your dream job and track your applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Hired"
            value={stats.hired}
            icon={Briefcase}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "jobs"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Available Jobs ({availableJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Applications ({applications.length})
            </button>
          </nav>
        </div>

        {activeTab === "jobs" && (
          <>
            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
              filterOptions={{
                experienceLevels: ["Entry Level", "Mid Level", "Senior Level"],
                jobTypes: ["Full-time", "Part-time", "Internship", "Contract"],
              }}
              type="jobs"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  showApplyButton={true}
                  onApply={handleApply}
                />
              ))}
            </div>

            {availableJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs available
                </h3>
                <p className="text-gray-600">
                  Check back later for new opportunities
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "applications" && (
          <div className="space-y-6">
            {applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                isStudentView={true}
              />
            ))}

            {applications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600">
                  Start applying to jobs to see your applications here
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Apply for {selectedJob.title}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={applying}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {applying ? "Applying..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
