import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create a new job (Recruiters only)
router.post('/', authenticate, authorize('recruiter'), [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 10 }),
  body('skills_required').isArray({ min: 1 }),
  body('location').trim().isLength({ min: 1 }),
  body('salary').trim().isLength({ min: 1 }),
  body('experience_level').isIn(['Entry Level', 'Mid Level', 'Senior Level']),
  body('job_type').isIn(['Full-time', 'Part-time', 'Internship', 'Contract'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      company: req.user.company,
      recruiter: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all jobs with filtering
router.get('/', [
  query('search').optional(),
  query('skills').optional(),
  query('experience_level').optional(),
  query('job_type').optional(),
  query('location').optional(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const {
      search,
      skills,
      experience_level,
      job_type,
      location,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills_required = { $in: skillsArray };
    }

    if (experience_level) {
      query.experience_level = experience_level;
    }

    if (job_type) {
      query.job_type = job_type;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get jobs posted by current recruiter
router.get('/my-jobs', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply to a job (Students only)
router.post('/:id/apply', authenticate, authorize('student'), [
  body('cover_letter').optional().trim()
], async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user._id;
    const { cover_letter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'Job is no longer active' });
    }

    const existingApplication = await Application.findOne({
      job_id: jobId,
      student_id: studentId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    const application = new Application({
      job_id: jobId,
      student_id: studentId,
      cover_letter
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for a job (Recruiters only)
router.get('/:id/applications', authenticate, authorize('recruiter'), [
  query('status').optional().isIn(['applied', 'shortlisted', 'rejected', 'hired']),
  query('skills').optional(),
  query('year').optional().isInt({ min: 1, max: 4 }),
  query('college').optional()
], async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status, skills, year, college } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let applicationQuery = { job_id: jobId };
    if (status) {
      applicationQuery.status = status;
    }

    let studentQuery = {};
    if (skills) {
      const skillsArray = skills.split(',');
      studentQuery.skills = { $in: skillsArray };
    }
    if (year) {
      studentQuery.year = Number(year);
    }
    if (college) {
      studentQuery.college = { $regex: college, $options: 'i' };
    }

    const applications = await Application.find(applicationQuery)
      .populate({
        path: 'student_id',
        match: studentQuery,
        select: 'name email college year skills'
      })
      .populate('job_id', 'title')
      .sort({ createdAt: -1 });

    // Filter out applications where student didn't match the query
    const filteredApplications = applications.filter(app => app.student_id !== null);

    res.json({ applications: filteredApplications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;