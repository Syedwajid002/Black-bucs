import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import FilterPanel from "../components/FilterPanel";
import ApplicationCard from "../components/ApplicationCard";
import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Plus, Briefcase, Users, CheckCircle, Award } from "lucide-react";

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormLoading, setJobFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicationsForJob(selectedJob._id);
    }
  }, [selectedJob, filters]);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/my-jobs");
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsForJob = async (jobId) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/jobs/${jobId}/applications?${params}`);
      setApplications(response.data.applications);
    } catch (error) {
      toast.error("Failed to fetch applications");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/applications/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics");
    }
  };

  const handleCreateJob = async (jobData) => {
    setJobFormLoading(true);
    try {
      await api.post("/jobs", jobData);
      toast.success("Job created successfully!");
      setShowJobForm(false);
      fetchJobs();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create job");
    } finally {
      setJobFormLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      toast.success(`Application ${status} successfully!`);

      if (selectedJob) {
        fetchApplicationsForJob(selectedJob._id);
      }
      fetchAnalytics();
    } catch (error) {
      toast.error("Failed to update application status");
    }
  };

  const getApplicationCount = (jobId) => {
    return applications.filter((app) => app.job_id._id === jobId).length;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recruiter Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your job postings and review applications
            </p>
          </div>
          <button
            onClick={() => setShowJobForm(true)}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Jobs"
              value={analytics.totalJobs}
              icon={Briefcase}
              color="blue"
            />
            <StatsCard
              title="Total Applications"
              value={analytics.totalApplications}
              icon={Users}
              color="green"
            />
            <StatsCard
              title="Shortlisted"
              value={
                analytics.statusStats?.find((s) => s._id === "shortlisted")
                  ?.count || 0
              }
              icon={Award}
              color="yellow"
            />
            <StatsCard
              title="Hired"
              value={
                analytics.statusStats?.find((s) => s._id === "hired")?.count ||
                0
              }
              icon={CheckCircle}
              color="purple"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab("jobs");
                setSelectedJob(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "jobs"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Applications
            </button>
          </nav>
        </div>

        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                showViewApplications={true}
                onViewApplications={(jobId) => {
                  const job = jobs.find((j) => j._id === jobId);
                  setSelectedJob(job || null);
                  setActiveTab("applications");
                }}
                applicationCount={getApplicationCount(job._id)}
              />
            ))}
          </div>
        )}

        {activeTab === "applications" && (
          <>
            {selectedJob && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Applications for: {selectedJob.title}
                </h2>
                <p className="text-gray-600">
                  {applications.length} applications received
                </p>
              </div>
            )}

            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
              filterOptions={{
                statuses: ["applied", "shortlisted", "rejected", "hired"],
                years: [1, 2, 3, 4],
              }}
              type="applications"
            />

            <div className="space-y-6">
              {applications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  showStatusActions={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>

            {applications.length === 0 && selectedJob && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600">
                  Applications will appear here when students apply
                </p>
              </div>
            )}

            {applications.length === 0 && !selectedJob && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a job to view applications
                </h3>
                <p className="text-gray-600">
                  Choose a job from the "My Jobs" tab to see applications
                </p>
              </div>
            )}
          </>
        )}

        {jobs.length === 0 && activeTab === "jobs" && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first job posting to get started
            </p>
            <button
              onClick={() => setShowJobForm(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          onSubmit={handleCreateJob}
          onCancel={() => setShowJobForm(false)}
          loading={jobFormLoading}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
