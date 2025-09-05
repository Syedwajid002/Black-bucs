import React from 'react';
import { Mail, GraduationCap, Calendar, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

const ApplicationCard = ({ application, onStatusUpdate, showStatusActions = false, isStudentView = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'hired':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'shortlisted':
        return <Award className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isStudentView && application.job_id && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.job_id.title}
          </h3>
          <p className="text-gray-600">{application.job_id.company}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{application.job_id.location}</span>
            <span>{application.job_id.salary}</span>
            <span>{application.job_id.job_type}</span>
          </div>
        </div>
      )}

      {!isStudentView && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.student_id.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{application.student_id.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <GraduationCap className="h-4 w-4" />
              <span>{application.student_id.college}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Year {application.student_id.year}</span>
            </div>
          </div>
        </div>
      )}

      {application.student_id.skills && application.student_id.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {application.student_id.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {application.cover_letter && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {application.cover_letter}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              application.status
            )}`}
          >
            {getStatusIcon(application.status)}
            <span className="capitalize">{application.status}</span>
          </span>
          <span className="text-sm text-gray-500">
            Applied {new Date(application.createdAt).toLocaleDateString()}
          </span>
        </div>

        {showStatusActions && onStatusUpdate && application.status === 'applied' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusUpdate(application._id, 'shortlisted')}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              Shortlist
            </button>
            <button
              onClick={() => onStatusUpdate(application._id, 'rejected')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Reject
            </button>
          </div>
        )}

        {showStatusActions && onStatusUpdate && application.status === 'shortlisted' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusUpdate(application._id, 'hired')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              Hire
            </button>
            <button
              onClick={() => onStatusUpdate(application._id, 'rejected')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
