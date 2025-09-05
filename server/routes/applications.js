import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get student's applications
router.get('/my-applications', authenticate, authorize('student'), async (req, res) => {
  try {
    console.log("In applications")
    const applications = await Application.find({ student_id: req.user._id })
      .populate('job_id', 'title company location salary job_type')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (Recruiters only)
router.patch('/:id/status', authenticate, authorize('recruiter'), [
  body('status').isIn(['applied', 'shortlisted', 'rejected', 'hired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate('job_id');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job_id.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics for recruiter
router.get('/analytics', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Get all jobs posted by this recruiter
    const jobs = await Job.find({ recruiter: recruiterId });
    const jobIds = jobs.map(job => job._id);

    // Get application statistics
    const totalApplications = await Application.countDocuments({
      job_id: { $in: jobIds }
    });

    const statusStats = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const skillsStats = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $unwind: '$student.skills' },
      {
        $group: {
          _id: '$student.skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalJobs: jobs.length,
      totalApplications,
      statusStats,
      skillsStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;