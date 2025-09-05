import React from "react";
import { MapPin, DollarSign, Clock, Users } from "lucide-react";

const JobCard = ({
  job,
  onApply,
  onViewApplications,
  showApplyButton = false,
  showViewApplications = false,
  applicationCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
            {job.job_type}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {job.experience_level}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills_required.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {applicationCount !== undefined && (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{applicationCount} applicants</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {showApplyButton && onApply && (
          <button
            onClick={() => onApply(job._id)}
            className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Apply Now
          </button>
        )}
        {showViewApplications && onViewApplications && (
          <button
            onClick={() => onViewApplications(job._id)}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Applications
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
