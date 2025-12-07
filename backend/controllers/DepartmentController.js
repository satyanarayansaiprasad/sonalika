const Department = require('../models/Department');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    // Fetch all departments without any filters to show all previously added departments
    const departments = await Department.find().sort({ createdAt: -1 });
    console.log(`Found ${departments.length} departments in database`);
    const departmentsArray = departments.map(dept => {
      const deptObj = dept.toObject ? dept.toObject() : dept;
      console.log('Department:', deptObj.name, 'isActive:', deptObj.isActive);
      return deptObj;
    });
    
    res.status(200).json({
      success: true,
      data: departmentsArray,
      count: departmentsArray.length
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};

// Get a single department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department.toObject ? department.toObject() : department
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, code, isActive } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Department name is required'
      });
    }
    
    // Check if department with same name already exists (case-insensitive, exact full text match)
    const trimmedName = name.trim();
    // Escape special regex characters and match entire string case-insensitively
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingDept = await Department.findOne({ 
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });
    
    if (existingDept) {
      return res.status(400).json({
        success: false,
        error: `Department "${trimmedName}" already exists`
      });
    }
    
    const departmentData = {
      name: name.trim(),
      description: description || '',
      isActive: isActive !== undefined ? isActive : true
    };
    
    if (code && code.trim() !== '') {
      departmentData.code = code.trim().toUpperCase();
    }
    
    const department = new Department(departmentData);
    await department.save();
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department.toObject ? department.toObject() : department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Department with this name or code already exists'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};

// Update a department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, code, isActive } = req.body;
    const departmentId = req.params.id;
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    // Check if name is being changed and if new name already exists (case-insensitive, exact full text match)
    if (name && name.trim() !== department.name) {
      const trimmedName = name.trim();
      // Escape special regex characters and match entire string case-insensitively
      const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingDept = await Department.findOne({ 
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        _id: { $ne: departmentId }
      });
      
      if (existingDept) {
        return res.status(400).json({
          success: false,
          error: `Department "${trimmedName}" already exists`
        });
      }
    }
    
    // Update fields
    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description;
    if (code) department.code = code.trim().toUpperCase();
    if (isActive !== undefined) department.isActive = isActive;
    
    department.updatedAt = Date.now();
    await department.save();
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department.toObject ? department.toObject() : department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name or code already exists'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    await Department.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};

