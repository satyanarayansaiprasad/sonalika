const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');

// Get all departments
router.get('/all', DepartmentController.getAllDepartments);

// Get a single department by ID
router.get('/:id', DepartmentController.getDepartmentById);

// Create a new department
router.post('/create', DepartmentController.createDepartment);

// Update a department
router.put('/update/:id', DepartmentController.updateDepartment);

// Delete a department
router.delete('/delete/:id', DepartmentController.deleteDepartment);

module.exports = router;

