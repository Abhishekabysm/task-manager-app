const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Validation schema
const projectSchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().allow('').max(500)
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if user has reached project limit
    const canCreateProject = await Project.checkProjectLimit(req.user.id);
    if (!canCreateProject) {
      return res.status(400).json({ message: 'Project limit reached (maximum 4 projects)' });
    }

    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user.id
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).send('Server error while creating project');
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects for a user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 }); // Newest first
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).send('Server error while fetching projects');
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project with its tasks
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      project,
      tasks
    });
  } catch (err) {
    console.error('Get project error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error while fetching project');
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(project);
  } catch (err) {
    console.error('Update project error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error while updating project');
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and its tasks
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project and associated tasks removed' });
  } catch (err) {
    console.error('Delete project error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error while deleting project');
  }
});

module.exports = router;
