import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },
  cover_letter: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure a student can only apply once per job
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);