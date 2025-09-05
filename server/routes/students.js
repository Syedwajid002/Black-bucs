import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all students (for recruiters)
router.get('/', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { skills, college, year } = req.query;
    
    let query = { role: 'student' };

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (year) {
      query.year = Number(year);
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;