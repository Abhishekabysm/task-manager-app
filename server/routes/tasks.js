const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth'); // Auth middleware
const Task = require('../models/Task'); // Task model
const User = require('../models/User'); // User model (to validate assignedTo)

// --- Validation Schemas ---

// Schema for creating a task
const createTaskSchema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional().allow(''), // Allow empty string
    dueDate: Joi.date().optional().allow(null), // Allow null
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    status: Joi.string().valid('To Do', 'In Progress', 'Done').required(),
    assignedTo: Joi.string().hex().length(24).optional().allow(null), // Optional ObjectId string
});

// Schema for updating a task (all fields optional)
const updateTaskSchema = Joi.object({
    title: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional().allow(''),
    dueDate: Joi.date().optional().allow(null),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
    assignedTo: Joi.string().hex().length(24).optional().allow(null), // Optional ObjectId string
}).min(1); // Require at least one field to update

// --- Routes ---

// --- Notification Routes --- (MOVED UP)
/**
 * @route   GET /api/tasks/notifications
 * @desc    Get tasks assigned to the user (acting as notifications)
 * @access  Private
 */
router.get('/notifications', auth, async (req, res) => {
    try {
        // Fetch tasks assigned to the logged-in user
        // Add more specific notification logic if needed (e.g., unread flag)
        const notifications = await Task.find({ assignedTo: req.user.id })
                                        .populate('createdBy', 'name email') // Changed from 'user' to 'createdBy'
                                        .sort({ createdAt: -1 }) // Show newest first
                                        .limit(10); // Limit the number of notifications shown

        res.json(notifications);
    } catch (err) {
        console.error('Get notifications error:', err.message);
        res.status(500).send('Server error while fetching notifications');
    }
});

/**
 * @route   PUT /api/tasks/notifications/:id
 * @desc    Mark a notification (task) as read (Placeholder)
 * @access  Private
 */
router.put('/notifications/:id', auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        // In a real app, you might update a 'read' flag on the task/notification
        // For now, just acknowledge the request for the specific task ID

        // Optional: Check if the task exists and is assigned to the user
        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            // Silently succeed even if task not found or not assigned,
            // or return 404/403 if strict checking is needed.
            // console.log(`Notification read attempt for task ${taskId} by user ${req.user.id}, task not found or not assigned.`);
            // return res.status(404).json({ message: 'Notification task not found or not assigned to user' });
        }

        console.log(`INFO: Notification for task ${taskId} marked as read by user ${req.user.id}. (Placeholder action)`);
        res.json({ message: 'Notification marked as read (placeholder)' });

    } catch (err) {
        console.error('Mark notification read error:', err.message);
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found (invalid ID format)' });
        }
        res.status(500).send('Server error while marking notification');
    }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    // 1. Validate request body
    const { error } = createTaskSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    try {
        // 2. Check if assigned user exists (if provided)
        if (assignedTo) {
            const assignedUserExists = await User.findById(assignedTo);
            if (!assignedUserExists) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }
        }

        // 3. Create new task object
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            status,
            assignedTo: assignedTo || null, // Store null if not provided
            createdBy: req.user.id, // Changed from user to createdBy
        });

        // 4. Save task to database
        const task = await newTask.save();

        // 5. Return created task
        res.status(201).json(task);

        // --- Placeholder for Notification ---
        if (task.assignedTo) {
            console.log(`INFO: Task ${task._id} created and assigned to user ${task.assignedTo}. Trigger notification here.`);
            // TODO: Implement actual notification logic (e.g., email, WebSocket)
        }
        // --- End Placeholder ---

    } catch (err) {
        console.error('Create task error:', err.message);
        res.status(500).send('Server error while creating task');
    }
});

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with filtering, searching, and dashboard views
 * @access  Private
 * @query   view=assignedToMe|createdByMe|overdue - Dashboard filter
 * @query   status=To Do|In Progress|Done - Filter by status
 * @query   priority=Low|Medium|High - Filter by priority
 * @query   search=text - Search title/description
 * @query   dueDate=today|overdue - Simplified date filter (can be expanded)
 */
router.get('/', auth, async (req, res) => {
    try {
        const { view, status, priority, search, dueDate } = req.query;
        const query = {}; // Base query object

        // --- Dashboard View Filters ---
        if (view === 'assignedToMe') {
            query.assignedTo = req.user.id;
        } else if (view === 'createdByMe') {
            query.createdBy = req.user.id; // Changed from user to createdBy
        } else if (view === 'overdue') {
            // Find tasks assigned to or created by the user that are overdue and not done
            query.$or = [ { createdBy: req.user.id }, { assignedTo: req.user.id } ]; // Changed from user to createdBy
            query.dueDate = { $lt: new Date() };
            query.status = { $ne: 'Done' }; // Overdue tasks are not 'Done'
        } else if (view === 'all') {
            // Show all tasks regardless of ownership or assignment
            // No additional filters, will return all tasks
        } else {
            // Default view: Tasks created by or assigned to the user OR unassigned tasks
            query.$or = [ 
                { createdBy: req.user.id }, // Changed from user to createdBy
                { assignedTo: req.user.id },
                { assignedTo: null } // Also show unassigned tasks
            ];
        }

        // --- Standard Filters ---
        if (status) {
            // Ensure status is one of the allowed enum values if provided
            const allowedStatuses = ['To Do', 'In Progress', 'Done'];
            if (allowedStatuses.includes(status)) {
                query.status = status;
            } else {
                 // Optional: return error for invalid status, or just ignore
                 console.warn(`Invalid status filter received: ${status}`);
            }
        }
        if (priority) {
             const allowedPriorities = ['Low', 'Medium', 'High'];
             if (allowedPriorities.includes(priority)) {
                query.priority = priority;
             } else {
                 console.warn(`Invalid priority filter received: ${priority}`);
             }
        }

        // --- Due Date Filter (Simplified) ---
        if (dueDate === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: todayStart, $lte: todayEnd };
        } else if (dueDate === 'overdue' && view !== 'overdue') { // Add overdue filter if not already set by view
             query.dueDate = { $lt: new Date() };
             // Ensure we don't overwrite status if already set
             query.status = query.status ? { ...query.status, $ne: 'Done' } : { $ne: 'Done' };
        }
        // Can add more complex date range filters here later

        // --- Search Filter ---
        if (search) {
            query.$text = { $search: search };
        }

        // --- Execute Query ---
        // Add .select('-__v') to exclude the version key if desired
        const tasks = await Task.find(query)
                                .populate('createdBy', 'name email') // Changed from 'user' to 'createdBy'
                                .populate('assignedTo', 'name email') // Populate assignee info
                                .sort({ createdAt: -1 }); // Sort by newest first (or based on query params)

        res.json(tasks);
    } catch (err) {
        console.error('Get tasks error:', err.message);
        res.status(500).send('Server error while fetching tasks');
    }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        // Check if task exists
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the logged-in user is authorized to view this task
        // For now, only the creator can view. Later, assigned user might also view.
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.json(task);
    } catch (err) {
        console.error('Get single task error:', err.message);
        if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
            return res.status(404).json({ message: 'Task not found (invalid ID format)' });
        }
        res.status(500).send('Server error while fetching task');
    }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
    // 1. Validate request body
    const { error } = updateTaskSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    // 2. Build task object with fields to update
    const taskFields = { ...req.body };
    
    // Add lastModifiedBy field when updating
    if (taskFields.assignedTo) {
        taskFields.lastModifiedBy = req.user.id;
    }

    try {
        let task = await Task.findById(req.params.id);

        // 3. Check if task exists
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // 4. Check if user owns the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // 5. Check if assigned user exists (if assignedTo is being updated)
        if (assignedTo) { // Check only if assignedTo is part of the update payload
            const assignedUserExists = await User.findById(assignedTo);
            if (!assignedUserExists) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }
        } else if (assignedTo === null) {
             // Allow unassigning by setting to null
             taskFields.assignedTo = null;
        }


        // 6. Update the task
        // findByIdAndUpdate runs schema validators by default
        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: taskFields },
            { new: true, runValidators: true, context: 'query' } // Return updated doc, run validators
        );

        res.json(task);

        // --- Placeholder for Notification ---
        // Check if assignedTo was part of the update and has a value
        if (taskFields.assignedTo && task.assignedTo) {
             // Compare old vs new assignment if needed, or just notify on any assignment update
            console.log(`INFO: Task ${task._id} updated and assigned to user ${task.assignedTo}. Trigger notification here.`);
             // TODO: Implement actual notification logic (e.g., email, WebSocket)
        } else if (taskFields.hasOwnProperty('assignedTo') && taskFields.assignedTo === null) {
            console.log(`INFO: Task ${task._id} unassigned. Trigger notification if needed.`);
        }
        // --- End Placeholder ---


    } catch (err) {
        console.error('Update task error:', err.message);
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found (invalid ID format)' });
        }
        res.status(500).send('Server error while updating task');
    }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        // 1. Check if task exists
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // 2. Check if user owns the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // 3. Delete the task
        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task removed' });

    } catch (err) {
        console.error('Delete task error:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found (invalid ID format)' });
        }
        res.status(500).send('Server error while deleting task');
    }
});


module.exports = router;
