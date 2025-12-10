import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { FiMenu, FiX, FiHome, FiDatabase, FiShoppingBag, FiPlus, FiAward, FiChevronDown, FiChevronUp, FiTrash2, FiEdit2, FiCheckCircle, FiLogOut, FiClock, FiXCircle, FiBriefcase, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi';

const API_BASE_URL = 'https://sonalika.onrender.com';

// MM Size mapping data
const MM_SIZE_MAPPING = {
  0.8: { seiveSize: '+0000-000', sieveSizeRange: '-2.0' },
  0.9: { seiveSize: '+000-00', sieveSizeRange: '-2.0' },
  1.0: { seiveSize: '+00-0', sieveSizeRange: '-2.0' },
  1.1: { seiveSize: '+0-1.0', sieveSizeRange: '-2.0' },
  1.2: { seiveSize: '+1.5-2.0', sieveSizeRange: '-2.0' },
  1.3: { seiveSize: '+2.5-3.0', sieveSizeRange: '+2.0-6.5' },
  1.4: { seiveSize: '+3.5-4.0', sieveSizeRange: '+2.0-6.5' },
  1.5: { seiveSize: '+4.5-5.0', sieveSizeRange: '+2.0-6.5' },
  1.6: { seiveSize: '+5.5-6.0', sieveSizeRange: '+2.0-6.5' },
  1.7: { seiveSize: '+6.0-6.5', sieveSizeRange: '+2.0-6.5' },
  1.8: { seiveSize: '+6.5-7.0', sieveSizeRange: '+6.5-8.0' },
  1.9: { seiveSize: '+7.0-7.5', sieveSizeRange: '+6.5-8.0' },
  2.0: { seiveSize: '+7.5-8.0', sieveSizeRange: '+6.5-8.0' },
  2.1: { seiveSize: '+8.0-8.5', sieveSizeRange: '+8.0-11.0' },
  2.2: { seiveSize: '+8.5-9.0', sieveSizeRange: '+8.0-11.0' },
  2.3: { seiveSize: '+9.0-9.5', sieveSizeRange: '+8.0-11.0' },
  2.4: { seiveSize: '+9.5-10.0', sieveSizeRange: '+8.0-11.0' },
  2.5: { seiveSize: '+10.0-10.5', sieveSizeRange: '+8.0-11.0' },
  2.6: { seiveSize: '+10.5-11.0', sieveSizeRange: '+8.0-11.0' },
  2.7: { seiveSize: '+11.0-11.5', sieveSizeRange: '+11.0-14.0' },
  2.8: { seiveSize: '+11.5-12.0', sieveSizeRange: '+11.0-14.0' },
  2.9: { seiveSize: '+12.0-12.5', sieveSizeRange: '+11.0-14.0' },
  3.0: { seiveSize: '+12.5-13.0', sieveSizeRange: '+11.0-14.0' },
  3.1: { seiveSize: '+13.0-13.5', sieveSizeRange: '+11.0-14.0' },
  3.2: { seiveSize: '+13.5-14.0', sieveSizeRange: '+11.0-14.0' },
  3.3: { seiveSize: '+14.0-14.5', sieveSizeRange: '+14.0-16.0' },
  3.4: { seiveSize: '+14.5-15.0', sieveSizeRange: '+14.0-16.0' },
  3.5: { seiveSize: '+15.0-15.5', sieveSizeRange: '+14.0-16.0' },
  3.6: { seiveSize: '+15.5-16.0', sieveSizeRange: '+14.0-16.0' },
  3.7: { seiveSize: '+16.0-16.5', sieveSizeRange: '+16.0-20.0' },
  3.8: { seiveSize: '+16.5-17.0', sieveSizeRange: '+16.0-20.0' },
  3.9: { seiveSize: '+17.0-17.5', sieveSizeRange: '+16.0-20.0' },
  4.0: { seiveSize: '+17.5-18.0', sieveSizeRange: '+16.0-20.0' },
  4.1: { seiveSize: '+18.0-18.5', sieveSizeRange: '+16.0-20.0' },
  4.2: { seiveSize: '+18.5-19.0', sieveSizeRange: '+16.0-20.0' },
  4.3: { seiveSize: '+19.0-19.5', sieveSizeRange: '+16.0-20.0' },
  4.4: { seiveSize: '+19.5-20.0', sieveSizeRange: '+16.0-20.0' }
};

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(() => {
    const saved = localStorage.getItem('activeMenu');
    return saved || 'dashboard';
  });
  
  const [masterType, setMasterType] = useState(() => {
    const saved = localStorage.getItem('masterType');
    return saved || null;
  });
  
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState([]);
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    types: [{ name: '', values: [{ value: '', description: '' }] }]
  });
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentSerialNumber, setNewDepartmentSerialNumber] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState('');
  const [editingDepartmentSerialNumber, setEditingDepartmentSerialNumber] = useState('');
  const [designsByDepartment, setDesignsByDepartment] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [editingDesignDepartment, setEditingDesignDepartment] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [selectedDepartmentForAction, setSelectedDepartmentForAction] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveMessage, setResolveMessage] = useState('');
  const [completedOrders, setCompletedOrders] = useState([]);
  
  // API Base URL
  const getApiBaseUrl = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3001' : 'https://sonalika.onrender.com');
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("team");
    navigate("/");
  };

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    localStorage.setItem('masterType', masterType);
  }, [activeMenu, masterType]);

  // Fetch departments when departments tab becomes active
  useEffect(() => {
    if (activeMenu === 'departments') {
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  // Fetch departments when trackOrder tab becomes active (for dropdown)
  useEffect(() => {
    if (activeMenu === 'trackOrder' && departments.length === 0) {
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  const [productForm, setProductForm] = useState({
    category: '',
    sizeType: '',
    sizeValue: ''
  });
  
  const [designForm, setDesignForm] = useState({
    serialNumber: '',
    category: '',
    grossWt: '',
    netWt: '',
    diaWt: '',
    diaPcs: '',
    clarity: '',
    color: '',
    mmSize: null, // Initialize as null instead of empty string
    seiveSize: '',
    sieveSizeRange: '',
    imageFile: null
  });

  // Socket.IO connection
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAllProductMasters();
    fetchAllDesignMasters();
    fetchAllCategories();
    loadAcceptedOrders();
    loadRejectedOrders();
    loadCompletedOrders();
    
    // Initialize Socket.IO connection
    const apiBaseUrl = getApiBaseUrl();
    const socketUrl = apiBaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket.IO connected');
      socketRef.current.emit('join-orders');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    // Listen for real-time order updates
    socketRef.current.on('order-accepted', (data) => {
      console.log('📨 Order accepted:', data);
      showNotification(data.message || 'New order accepted', false);
      loadAcceptedOrders();
      if (selectedOrderForTracking && selectedOrderForTracking.orderId === data.order.orderId) {
        handleTrackOrder(data.order);
      }
    });

    socketRef.current.on('order-moved', (data) => {
      console.log('📨 Order moved:', data);
      showNotification(data.message || 'Order moved to next department', false);
      loadAcceptedOrders();
      loadCompletedOrders();
      if (selectedOrderForTracking && selectedOrderForTracking.orderId === data.order.orderId) {
        handleTrackOrder(data.order);
      }
    });

    socketRef.current.on('order-completed', (data) => {
      console.log('📨 Order completed:', data);
      showNotification(data.message || 'Order completed successfully', false);
      loadAcceptedOrders();
      loadCompletedOrders();
      if (selectedOrderForTracking && selectedOrderForTracking.orderId === data.order.orderId) {
        setSelectedOrderForTracking(null);
      }
    });

    socketRef.current.on('order-pending', (data) => {
      console.log('📨 Order pending:', data);
      showNotification(data.message || 'Order marked as pending', false);
      loadAcceptedOrders();
      if (selectedOrderForTracking && selectedOrderForTracking.orderId === data.order.orderId) {
        handleTrackOrder(data.order);
      }
    });

    socketRef.current.on('order-resolved', (data) => {
      console.log('📨 Order resolved:', data);
      showNotification(data.message || 'Pending issue resolved', false);
      loadAcceptedOrders();
      if (selectedOrderForTracking && selectedOrderForTracking.orderId === data.order.orderId) {
        handleTrackOrder(data.order);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-orders');
        socketRef.current.disconnect();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAcceptedOrders = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/orders/accepted`);
      if (response.data.success && response.data.data) {
        // Transform DB orders to match frontend format
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          orderDate: order.orderDate,
          clientName: order.clientName,
          description: order.description,
          gold: order.gold,
          diamond: order.diamond,
          silver: order.silver,
          platinum: order.platinum,
          status: order.status,
          acceptedDate: order.acceptedDate,
          currentDepartment: order.currentDepartment,
          departmentStatus: order.departmentStatus || [],
          pendingMessages: order.pendingMessages || []
        }));
        setAcceptedOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
    }
  };

  const loadRejectedOrders = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/orders/rejected`);
      if (response.data.success && response.data.data) {
        // Transform DB orders to match frontend format
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          orderDate: order.orderDate,
          clientName: order.clientName,
          description: order.description,
          gold: order.gold,
          diamond: order.diamond,
          silver: order.silver,
          platinum: order.platinum,
          status: order.status,
          rejectionReason: order.rejectionReason || '',
          rejectedDate: order.rejectedDate
        }));
        setRejectedOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching rejected orders:', error);
    }
  };

  // Track Order Functions
  const fetchDesignsByDepartment = async () => {
    try {
      setLoadingDesigns(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/pdmaster/getDesignsByDepartment`);
      
      if (response.data && response.data.success && response.data.data) {
        setDesignsByDepartment(response.data.data);
      } else {
        setDesignsByDepartment([]);
      }
    } catch (error) {
      console.error('Error fetching designs by department:', error);
      console.error('Error response:', error.response);
      // Don't show error notification if it's a 404 - might be deployment issue
      if (error.response?.status !== 404) {
        showNotification('Failed to fetch designs', true);
      }
      setDesignsByDepartment([]);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleTrackOrder = async (order) => {
    // Fetch fresh order data with department info
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/orders/accepted`);
      if (response.data.success && response.data.data) {
        const freshOrder = response.data.data.find(o => o.orderId === order.orderId);
        if (freshOrder) {
          console.log('Fresh order data:', freshOrder);
          console.log('Current Department:', freshOrder.currentDepartment);
          console.log('Department Status:', freshOrder.departmentStatus);
          
          setSelectedOrderForTracking({
            id: freshOrder.orderId,
            orderId: freshOrder.orderId,
            orderDate: freshOrder.orderDate,
            clientName: freshOrder.clientName,
            description: freshOrder.description,
            status: freshOrder.status,
            currentDepartment: freshOrder.currentDepartment,
            departmentStatus: freshOrder.departmentStatus || [],
            pendingMessages: freshOrder.pendingMessages || []
          });
        } else {
          console.log('Order not found in fresh data, using provided order:', order);
          setSelectedOrderForTracking(order);
        }
      } else {
        console.log('No fresh data available, using provided order:', order);
        setSelectedOrderForTracking(order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrderForTracking(order);
    }
    // Fetch designs for this order
    fetchDesignsByDepartment(order.orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrderForTracking(null);
    setDesignsByDepartment([]);
  };

  const handleMoveToNext = async (orderId) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.put(`${apiBaseUrl}/api/orders/move-to-next/${orderId}`);
      
      if (response.data.success) {
        showNotification(response.data.message || 'Order moved to next department');
        await loadAcceptedOrders();
        await loadCompletedOrders();
        if (selectedOrderForTracking) {
          const updatedOrder = response.data.data;
          setSelectedOrderForTracking({
            ...selectedOrderForTracking,
            currentDepartment: updatedOrder.currentDepartment,
            departmentStatus: updatedOrder.departmentStatus,
            status: updatedOrder.status
          });
        }
      }
    } catch (error) {
      console.error('Error moving order:', error);
      showNotification(error.response?.data?.error || 'Failed to move order', true);
    }
  };

  const handleMarkPending = (dept) => {
    setSelectedDepartmentForAction(dept);
    setPendingModalOpen(true);
  };

  const handleSubmitPending = async () => {
    if (!pendingMessage.trim()) {
      showNotification('Please enter a pending reason', true);
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.put(
        `${apiBaseUrl}/api/orders/mark-pending/${selectedOrderForTracking.orderId}`,
        { message: pendingMessage.trim() }
      );
      
      if (response.data.success) {
        showNotification('Order marked as pending');
        setPendingModalOpen(false);
        setPendingMessage('');
        await loadAcceptedOrders();
        if (selectedOrderForTracking) {
          const updatedOrder = response.data.data;
          setSelectedOrderForTracking({
            ...selectedOrderForTracking,
            departmentStatus: updatedOrder.departmentStatus,
            pendingMessages: updatedOrder.pendingMessages
          });
        }
      }
    } catch (error) {
      console.error('Error marking pending:', error);
      showNotification(error.response?.data?.error || 'Failed to mark as pending', true);
    }
  };

  const handleResolvePending = () => {
    setResolveModalOpen(true);
  };

  const handleSubmitResolve = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.put(
        `${apiBaseUrl}/api/orders/resolve-pending/${selectedOrderForTracking.orderId}`,
        { resolvedMessage: resolveMessage.trim() || 'Issue resolved' }
      );
      
      if (response.data.success) {
        showNotification('Pending issue resolved');
        setResolveModalOpen(false);
        setResolveMessage('');
        await loadAcceptedOrders();
        if (selectedOrderForTracking) {
          const updatedOrder = response.data.data;
          setSelectedOrderForTracking({
            ...selectedOrderForTracking,
            departmentStatus: updatedOrder.departmentStatus,
            pendingMessages: updatedOrder.pendingMessages
          });
        }
      }
    } catch (error) {
      console.error('Error resolving pending:', error);
      showNotification(error.response?.data?.error || 'Failed to resolve pending', true);
    }
  };

  const loadCompletedOrders = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/orders/completed`);
      if (response.data.success && response.data.data) {
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          orderDate: order.orderDate,
          clientName: order.clientName,
          description: order.description,
          status: order.status,
          completedDate: order.completedDate,
          departmentStatus: order.departmentStatus || []
        }));
        setCompletedOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  };

  const handleUpdateDesignDepartment = async (designId, departmentId) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.put(
        `${apiBaseUrl}/api/pdmaster/updateDesignDepartment/${designId}`,
        { departmentId: departmentId || null }
      );
      
      if (response.data.success) {
        showNotification('Design department updated successfully');
        setEditingDesignDepartment(null);
        fetchDesignsByDepartment();
      }
    } catch (error) {
      console.error('Error updating design department:', error);
      showNotification(error.response?.data?.error || 'Failed to update design department', true);
    }
  };

  // Departments Management Functions
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      console.log('Fetching departments from:', `${apiBaseUrl}/api/departments/all`);
      const response = await axios.get(`${apiBaseUrl}/api/departments/all`);
      console.log('Departments API response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('Setting departments:', response.data.data);
        setDepartments(response.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('Response is array, setting departments:', response.data);
        setDepartments(response.data);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      console.error('Error details:', error.response?.data);
      showNotification('Failed to fetch departments', true);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      if (!newDepartmentName.trim()) {
        showNotification('Department name is required', true);
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const requestData = {
        name: newDepartmentName.trim(),
        description: '',
        isActive: true
      };
      
      // Add serialNumber if provided
      if (newDepartmentSerialNumber.trim() !== '') {
        const serialNum = parseInt(newDepartmentSerialNumber.trim());
        if (!isNaN(serialNum) && serialNum > 0) {
          requestData.serialNumber = serialNum;
        }
      }
      
      const response = await axios.post(`${apiBaseUrl}/api/departments/create`, requestData);
      
      if (response.data.success) {
        showNotification('Department created successfully');
        setNewDepartmentName('');
        setNewDepartmentSerialNumber('');
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error creating department:', error);
      showNotification(error.response?.data?.error || 'Failed to create department', true);
    }
  };

  const handleUpdateDepartment = async (id) => {
    try {
      if (!editingDepartmentName.trim()) {
        showNotification('Department name is required', true);
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const requestData = {
        name: editingDepartmentName.trim()
      };
      
      // Add serialNumber if provided
      if (editingDepartmentSerialNumber.trim() !== '') {
        const serialNum = parseInt(editingDepartmentSerialNumber.trim());
        if (!isNaN(serialNum) && serialNum > 0) {
          requestData.serialNumber = serialNum;
        }
      }
      
      const response = await axios.put(`${apiBaseUrl}/api/departments/update/${id}`, requestData);
      
      if (response.data.success) {
        showNotification('Department updated successfully');
        setEditingDepartmentId(null);
        setEditingDepartmentName('');
        setEditingDepartmentSerialNumber('');
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error updating department:', error);
      showNotification(error.response?.data?.error || 'Failed to update department', true);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.delete(`${apiBaseUrl}/api/departments/delete/${id}`);
      
      if (response.data.success) {
        showNotification('Department deleted successfully');
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      showNotification(error.response?.data?.error || 'Failed to delete department', true);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartmentId(department._id);
    setEditingDepartmentName(department.name);
    setEditingDepartmentSerialNumber(department.serialNumber || '');
  };

  const handleCancelEdit = () => {
    setEditingDepartmentId(null);
    setEditingDepartmentName('');
    setEditingDepartmentSerialNumber('');
  };


  const showNotification = (message, isError = false) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => {
      setNotification({ show: false, message: '', isError: false });
    }, 5000);
  };

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/category-size`);
      setCategories(response.data.data);
    } catch (error) {
      showNotification('Failed to fetch categories', true);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductMasters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllProductMasters`);
      setProductMasters(response.data.data);
    } catch (error) {
      showNotification('Failed to fetch product masters', true);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDesignMasters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllDesignMasters`);
      setDesignMasters(response.data.data);
    } catch (error) {
      showNotification('Failed to fetch design masters', true);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    const selectedCategory = categories.find(cat => cat.name === value);
    const types = selectedCategory?.types || [];
    setCategoryTypes(types);
    setProductForm({
      ...productForm,
      category: value,
      sizeType: '',
      sizeValue: ''
    });
    setSizeValues([]);
  };

  const handleSizeTypeChange = (value, category) => {
    const selectedCategory = categories.find(cat => cat.name === category);
    const selectedType = selectedCategory?.types.find(type => type.name === value);
    const values = selectedType?.values || [];
    setSizeValues(values);
    setProductForm({
      ...productForm,
      sizeType: value,
      sizeValue: ''
    });
  };

  const handleDesignImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a JPEG, PNG, or WebP image', true);
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification('Image must be smaller than 5MB', true);
        return;
      }

      setDesignForm({
        ...designForm,
        imageFile: file
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.category || !productForm.sizeType || !productForm.sizeValue) {
      showNotification('Please fill all fields', true);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createProductMaster`,
        {
          category: productForm.category,
          sizeType: productForm.sizeType,
          sizeValue: productForm.sizeValue
        }
      );

      if (response.data.success) {
        showNotification('Product Master created successfully!');
        setProductForm({
          category: '',
          sizeType: '',
          sizeValue: ''
        });
        fetchAllProductMasters();
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      showNotification(`Error: ${error.response?.data?.message || error.message}`, true);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMMSizeChange = (mmSize) => {
    const mapping = MM_SIZE_MAPPING[mmSize];
    
    if (mapping) {
      const newFormData = {
        ...designForm,
        mmSize: mmSize, // Keep as number, don't parse again
        seiveSize: mapping.seiveSize,
        sieveSizeRange: mapping.sieveSizeRange
      };
      setDesignForm(newFormData);
    }
  };

  const handleDesignSubmit = async (e) => {
    e.preventDefault();
    
    if (!designForm.serialNumber || !designForm.category || !designForm.grossWt || !designForm.netWt || 
        !designForm.diaWt || !designForm.diaPcs || !designForm.clarity || 
        !designForm.color || !designForm.imageFile) {
      showNotification('Please fill all fields and upload a design image', true);
      return;
    }

    // Check if MM Size is selected (optional for now)
    if (designForm.mmSize === null) {
      // showNotification('Please select an MM Size', true);
      // return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('serialNumber', designForm.serialNumber);
      formData.append('category', designForm.category);
      formData.append('grossWt', designForm.grossWt);
      formData.append('netWt', designForm.netWt);
      formData.append('diaWt', designForm.diaWt);
      formData.append('diaPcs', designForm.diaPcs);
      formData.append('clarity', designForm.clarity);
      formData.append('color', designForm.color);
      // Always send the new fields
      const mmSizeValue = designForm.mmSize !== null ? parseFloat(designForm.mmSize) : 0;
      const seiveSizeValue = designForm.seiveSize || '';
      const sieveSizeRangeValue = designForm.sieveSizeRange || '';
      
      formData.append('mmSize', mmSizeValue);
      formData.append('seiveSize', seiveSizeValue);
      formData.append('sieveSizeRange', sieveSizeRangeValue);
      formData.append('image', designForm.imageFile);



      await axios.post(
        `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showNotification('Design Master created successfully!');
      setDesignForm({
        serialNumber: '',
        category: '',
        grossWt: '',
        netWt: '',
        diaWt: '',
        diaPcs: '',
        clarity: '',
        color: '',
        mmSize: null,
        seiveSize: '',
        sieveSizeRange: '',
        imageFile: null
      });
      setPreviewImage(null);
      fetchAllDesignMasters();
    } catch (error) {
      showNotification(`Failed to create design master: ${error.response?.data?.message || error.message}`, true);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/pdmaster/category-size`, {
        name: newCategory.name,
        types: newCategory.types
      });
      
      if (response.data.message === "Category added successfully") {
        showNotification('Category added successfully!');
        setNewCategory({
          name: '',
          types: [{ name: '', values: [{ value: '', description: '' }] }]
        });
        setShowAddCategory(false);
        fetchAllCategories();
      } else {
        throw new Error(response.data.message || 'Failed to add category');
      }
    } catch (error) {
      showNotification(`Error: ${error.response?.data?.message || error.message}`, true);
      console.error('Add category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addType = () => {
    setNewCategory({
      ...newCategory,
      types: [...newCategory.types, { name: '', values: [{ value: '', description: '' }] }]
    });
  };

  const removeType = (index) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes.splice(index, 1);
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const addValue = (typeIndex) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values.push({ value: '', description: '' });
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const removeValue = (typeIndex, valueIndex) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values.splice(valueIndex, 1);
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const handleTypeChange = (index, field, value) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[index][field] = value;
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const handleValueChange = (typeIndex, valueIndex, field, value) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values[valueIndex][field] = value;
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const renderDashboard = () => {
    const colors = {
      gold: "#f9e79f",
      darkGold: "#D4AF37",
      deepNavy: "#00072D",
      platinum: "#E5E4E2",
      light: "#F8F8F8",
      diamond: "rgba(255,255,255,0.95)",
      success: "#10b981",
      info: "#3b82f6",
      warning: "#f59e0b",
    };

    return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.deepNavy }}>
            Production Dashboard
          </h1>
          <p className="text-gray-600">Manage your product and design masters efficiently</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="rounded-xl shadow-lg p-6 border-2 relative overflow-hidden group cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${colors.deepNavy} 0%, #1a1a2e 100%)`,
              borderColor: colors.info,
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${colors.info} 0%, transparent 70%)` }}
            />
            <div className="relative z-10 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-xl bg-white bg-opacity-20">
                  <FiShoppingBag className="text-2xl" style={{ color: colors.gold }} />
            </div>
            </div>
              <h3 className="text-sm font-medium opacity-80 mb-2">Product Masters</h3>
              <p className="text-4xl font-bold" style={{ color: colors.gold }}>{productMasters.length}</p>
          </div>
          </motion.div>
        
          <motion.div 
            className="rounded-xl shadow-lg p-6 border-2 relative overflow-hidden group cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${colors.deepNavy} 0%, #1a1a2e 100%)`,
              borderColor: colors.warning,
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${colors.warning} 0%, transparent 70%)` }}
            />
            <div className="relative z-10 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-xl bg-white bg-opacity-20">
                  <FiAward className="text-2xl" style={{ color: colors.gold }} />
            </div>
            </div>
              <h3 className="text-sm font-medium opacity-80 mb-2">Design Masters</h3>
              <p className="text-4xl font-bold" style={{ color: colors.gold }}>{designMasters.length}</p>
          </div>
          </motion.div>
      </div>

        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 border-2"
          style={{ borderColor: colors.gold }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center mb-6 pb-4 border-b-2" style={{ borderColor: colors.gold }}>
            <FiClock className="h-6 w-6 mr-3" style={{ color: colors.darkGold }} />
            <h2 className="text-xl font-bold" style={{ color: colors.deepNavy }}>Recent Activity</h2>
          </div>
          <div className="space-y-3">
          {productMasters.slice(0, 3).map((product, index) => (
              <motion.div 
                key={`product-${index}`}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: `${colors.info}15` }}>
                  <FiShoppingBag className="text-xl" style={{ color: colors.info }} />
              </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">New Product Added</p>
                  <p className="text-sm text-gray-600">{product.category} - {product.serialNumber}</p>
              </div>
                <div className="text-sm text-gray-400 font-medium">
                Just now
              </div>
              </motion.div>
          ))}
          {designMasters.slice(0, 3).map((design, index) => (
              <motion.div 
                key={`design-${index}`}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: `${colors.warning}15` }}>
                  <FiAward className="text-xl" style={{ color: colors.warning }} />
              </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">New Design Added</p>
                  <p className="text-sm text-gray-600">{design.serialNumber} - {design.styleNumber || 'N/A'}</p>
              </div>
                <div className="text-sm text-gray-400 font-medium">
                Just now
              </div>
              </motion.div>
          ))}
            {productMasters.length === 0 && designMasters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
        </div>
            )}
      </div>
        </motion.div>
    </div>
  );
  };

  const renderProductMasterForm = () => (
    <div className="bg-white h-screen rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create Product Master</h2>
        <button 
          onClick={() => {
            setMasterType(null);
            setActiveMenu('master');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
      
      <form onSubmit={handleProductSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={productForm.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size Type</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={productForm.sizeType}
              onChange={(e) => handleSizeTypeChange(e.target.value, productForm.category)}
              disabled={!productForm.category}
              required
            >
              <option value="">Select size type</option>
              {categoryTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size Value</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={productForm.sizeValue}
              onChange={(e) => setProductForm({...productForm, sizeValue: e.target.value})}
              disabled={!productForm.sizeType}
              required
            >
              <option value="">Select size value</option>
              {sizeValues.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.value} - {item.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Create Product Master'
            )}
          </button>
        </div>
      </form>

      {/* Add Category Section */}
      <div className="mt-12  p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Category Management</h2>
          <button 
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center text-[#00072D] hover:text-blue-700"
          >
            {showAddCategory ? (
              <>
                <FiChevronUp className="mr-1" />
                Hide Form
              </>
            ) : (
              <>
                <FiPlus className="mr-1" />
                Add New Category
              </>
            )}
          </button>
        </div>

        {showAddCategory && (
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value.toUpperCase()})}
                placeholder="e.g., NECKLACE, BRACELET"
                required
              />
            </div>

            {newCategory.types.map((type, typeIndex) => (
              <div key={typeIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Size Type {typeIndex + 1}</h3>
                  {newCategory.types.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeType(typeIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={type.name}
                    onChange={(e) => handleTypeChange(typeIndex, 'name', e.target.value)}
                    placeholder="e.g., Length, Size, Diameter"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Size Values</h4>
                    <button
                      type="button"
                      onClick={() => addValue(typeIndex)}
                      className="flex items-center text-sm text-[#00072D] hover:text-blue-700"
                    >
                      <FiPlus className="mr-1" />
                      Add Value
                    </button>
                  </div>

                  {type.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={value.value}
                          onChange={(e) => handleValueChange(typeIndex, valueIndex, 'value', e.target.value)}
                          placeholder="e.g., S, M, L or 36cm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <div className="flex">
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            value={value.description}
                            onChange={(e) => handleValueChange(typeIndex, valueIndex, 'description', e.target.value)}
                            placeholder="e.g., 14 inches, Small size"
                            required
                          />
                          {type.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeValue(typeIndex, valueIndex)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addType}
                className="flex items-center text-[#00072D] hover:text-blue-700"
              >
                <FiPlus className="mr-1" />
                Add Another Size Type
              </button>
              
              <button 
                type="submit" 
                className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Save Category'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg">{category.name}</h4>
                  <button className="text-gray-500 hover:text-gray-700">
                    <FiEdit2 />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {category.types.map((type, typeIndex) => (
                    <div key={typeIndex} className="ml-4">
                      <h5 className="font-medium">{type.name}</h5>
                      <ul className="list-disc ml-6 text-sm text-gray-600">
                        {type.values.map((value, valueIndex) => (
                          <li key={valueIndex}>
                            <span className="font-medium">{value.value}</span>: {value.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesignMasterForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create Design Master</h2>
        <button 
          onClick={() => {
            setMasterType(null);
            setActiveMenu('master');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
      
      <form onSubmit={handleDesignSubmit} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
    <select
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      value={designForm.category || ''}
      onChange={(e) => {
        const selectedCategory = e.target.value;
        const matchedProduct = productMasters.find(p => p.category === selectedCategory);
        setDesignForm({
          ...designForm,
          category: selectedCategory,
          serialNumber: matchedProduct?.serialNumber || ''
        });
      }}
      required
    >
      <option value="">Select category</option>
      {categories.map(category => (
        <option key={category._id} value={category.name}>{category.name}</option>
      ))}
    </select>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.grossWt}
                onChange={(e) => setDesignForm({...designForm, grossWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.netWt}
                onChange={(e) => setDesignForm({...designForm, netWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.diaWt}
                onChange={(e) => setDesignForm({...designForm, diaWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ct</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Pieces</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.diaPcs}
              onChange={(e) => setDesignForm({...designForm, diaPcs: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clarity</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.clarity}
              onChange={(e) => setDesignForm({...designForm, clarity: e.target.value})}
              required
            >
              <option value="">Select clarity</option>
              <option value="vvs">VVS</option>
              <option value="vs">VS</option>
              <option value="si">SI</option>
              <option value="i">I</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.color}
              onChange={(e) => setDesignForm({...designForm, color: e.target.value})}
              required
            >
              <option value="">Select color</option>
              <option value="d-f">D-F</option>
              <option value="g-h">G-H</option>
              <option value="i-j">I-J</option>
              <option value="k-l">K-L</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MM Size *</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.mmSize ? String(designForm.mmSize) : ''}
              onChange={(e) => {
                const value = e.target.value;
                
                if (value) {
                  const numValue = parseFloat(value);
                  handleMMSizeChange(numValue);
                } else {
                  // Handle empty selection - reset the fields
                  setDesignForm(prev => ({
                    ...prev,
                    mmSize: null,
                    seiveSize: '',
                    sieveSizeRange: ''
                  }));
                }
              }}
              required
            >
              <option value="">Select MM Size</option>
              {Object.keys(MM_SIZE_MAPPING).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seive / Size</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              value={designForm.seiveSize || ''}
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sieve Size Range</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              value={designForm.sieveSizeRange || ''}
              readOnly
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Design Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                onChange={handleDesignImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="design-image-upload"
                required
              />
              <label
                htmlFor="design-image-upload"
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition"
              >
                <FiPlus className="mr-2" />
                Choose Design Image
              </label>
            </div>
            {previewImage && (
              <div className="relative group">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setDesignForm({...designForm, imageFile: null});
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload a high-quality image (JPEG, PNG, WebP) under 5MB
          </p>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Create Design Master'
            )}
          </button>
        </div>
      </form>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Design Master Records</h2>
          <span className="text-sm text-gray-500">{designMasters.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Serial</th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Design Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Wt (ct)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Pcs</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MM Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seive / Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sieve Size Range</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {designMasters.map((design) => (
                    <tr key={design._id} className="hover:bg-gray-50 transition">
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{design.serialNumber}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.styleNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {design.imageFile ? (
                          <img 
                            src={design.imageFile} 
                            alt="Design" 
                            className="h-10 w-10 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMi4yMDkxIDIwIDI0IDE4LjIwOTEgMjQgMTZDMjQgMTMuNzkwOSAyMi4yMDkxIDEyIDIwIDEyQzE3Ljc5MDkgMTIgMTYgMTMuNzkwOSAxNiAxNkMxNiAxOC4yMDkxIDE3Ljc5MDkgMjAgMjAgMjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCAyNkMxNi42ODYzIDI2IDE0IDIzLjMxMzcgMTQgMjBIMTZDMTYgMjIuMjA5MSAxNy43OTA5IDI0IDIwIDI0QzIyLjIwOTEgMjQgMjQgMjIuMjA5MSAyNCAyMEgyNkMyNiAyMy4zMTM3IDIzLjMxMzcgMjYgMjAgMjZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.grossWt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.netWt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.diaWt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.diaPcs}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.mmSize || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.seiveSize || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.sieveSizeRange || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMasterDataMenu = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
          onClick={() => setMasterType('product')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <FiShoppingBag className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Product Master</h3>
              <p className="text-sm text-gray-500">{productMasters.length} records</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
          onClick={() => setMasterType('design')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
              <FiAward className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Design Master</h3>
              <p className="text-sm text-gray-500">{designMasters.length} records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcceptedOrders = () => {
    const colors = {
      gold: "#f9e79f",
      darkGold: "#D4AF37",
      deepNavy: "#00072D",
      platinum: "#E5E4E2",
      light: "#F8F8F8",
      diamond: "rgba(255,255,255,0.95)",
      success: "#10b981",
      info: "#3b82f6",
      warning: "#f59e0b",
    };

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.deepNavy }}>
            Accepted & Rejected Orders
          </h1>
          <p className="text-gray-600">Orders processed by Accounts department</p>
        </div>

        {/* Accepted Orders Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.success }}>
            Accepted Orders ({acceptedOrders.length})
          </h2>
          {acceptedOrders.length === 0 ? (
            <motion.div
              className="bg-white rounded-xl shadow-lg p-12 text-center border-2"
              style={{ borderColor: colors.gold }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiCheckCircle className="mx-auto text-6xl mb-4" style={{ color: colors.info }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.deepNavy }}>
                No Accepted Orders
              </h3>
              <p className="text-gray-600">Accepted orders from Accounts will appear here</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-white rounded-xl shadow-lg border-2 overflow-hidden" style={{ borderColor: colors.success }}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: colors.deepNavy, color: colors.gold }}>
                      <th className="px-4 py-3 text-left border border-gray-300">Order ID</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Order Date</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Accepted Date</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Client Name</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Description</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Gold</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Diamond</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Silver</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Platinum</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ backgroundColor: '#d1fae5' }}
                      >
                        <td className="px-4 py-3 border border-gray-300 font-semibold">{order.orderId || order.id}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.orderDate}</td>
                        <td className="px-4 py-3 border border-gray-300">
                          {order.acceptedDate ? new Date(order.acceptedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 border border-gray-300">{order.clientName}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.description}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.gold.quantity} {order.gold.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.diamond.quantity} {order.diamond.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.silver.quantity} {order.silver.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.platinum.quantity} {order.platinum.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            ACCEPTED
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rejected Orders Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#ef4444' }}>
            Rejected Orders ({rejectedOrders.length})
          </h2>
          {rejectedOrders.length === 0 ? (
            <motion.div
              className="bg-white rounded-xl shadow-lg p-12 text-center border-2"
              style={{ borderColor: colors.gold }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiXCircle className="mx-auto text-6xl mb-4" style={{ color: '#ef4444' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.deepNavy }}>
                No Rejected Orders
              </h3>
              <p className="text-gray-600">Rejected orders from Accounts will appear here</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-white rounded-xl shadow-lg border-2 overflow-hidden" style={{ borderColor: '#ef4444' }}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: colors.deepNavy, color: colors.gold }}>
                      <th className="px-4 py-3 text-left border border-gray-300">Order ID</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Order Date</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Rejected Date</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Client Name</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Description</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Gold</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Diamond</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Silver</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Platinum</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Rejection Reason</th>
                      <th className="px-4 py-3 text-left border border-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ backgroundColor: '#fee2e2' }}
                      >
                        <td className="px-4 py-3 border border-gray-300 font-semibold">{order.orderId || order.id}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.orderDate}</td>
                        <td className="px-4 py-3 border border-gray-300">
                          {order.rejectedDate ? new Date(order.rejectedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 border border-gray-300">{order.clientName}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.description}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.gold.quantity} {order.gold.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.diamond.quantity} {order.diamond.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.silver.quantity} {order.silver.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">{order.platinum.quantity} {order.platinum.unit}</td>
                        <td className="px-4 py-3 border border-gray-300">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-red-800">{order.rejectionReason || 'Not enough materials available at accounts'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 border border-gray-300">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                            REJECTED
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCompletedOrders = () => {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Orders</h2>
          
          {completedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiCheckCircle className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No completed orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-green-100">
                    <th className="px-6 py-4 text-left border border-gray-200 font-semibold text-gray-700">Order No</th>
                    <th className="px-6 py-4 text-left border border-gray-200 font-semibold text-gray-700">Client Name</th>
                    <th className="px-6 py-4 text-left border border-gray-200 font-semibold text-gray-700">Completed Date</th>
                    <th className="px-6 py-4 text-center border border-gray-200 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-green-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-800">{order.orderId}</td>
                      <td className="px-6 py-4 border border-gray-200 text-gray-700">{order.clientName}</td>
                      <td className="px-6 py-4 border border-gray-200 text-gray-600">
                        {order.completedDate ? new Date(order.completedDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 border border-gray-200 text-center">
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                          Complete
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const renderTrackOrder = () => {
    // If an order is selected for tracking, show the tracking UI
    if (selectedOrderForTracking) {
      // Get departments sorted by serial number
      const sortedDepartments = [...departments].sort((a, b) => {
        if (a.serialNumber === null || a.serialNumber === undefined) return 1;
        if (b.serialNumber === null || b.serialNumber === undefined) return -1;
        return a.serialNumber - b.serialNumber;
      });

      return (
        <div className="space-y-6">
          {/* Back Button and Order Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white"
          >
            <motion.button
              onClick={handleBackToOrders}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors mb-4 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiChevronUp className="rotate-[-90deg]" />
              Back to Orders
            </motion.button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Track Your Order</h2>
                {selectedOrderForTracking.status === 'completed' ? (
                  <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-400">
                    <p className="text-green-100 font-semibold text-lg flex items-center gap-2">
                      <FiCheckCircle className="text-xl" />
                      Order Completed Successfully!
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-blue-100"><span className="font-semibold text-white">Order ID:</span> {selectedOrderForTracking.orderId}</p>
                    <p className="text-blue-100"><span className="font-semibold text-white">Client:</span> {selectedOrderForTracking.clientName}</p>
                    <p className="text-blue-100"><span className="font-semibold text-white">Order Date:</span> {selectedOrderForTracking.orderDate}</p>
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <FiPackage className="text-8xl opacity-20" />
              </div>
            </div>
          </motion.div>

          {/* Tracking Timeline - Simple Animated Design */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            {loadingDesigns ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading tracking information...</p>
              </div>
            ) : sortedDepartments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiBriefcase className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No departments found. Please add departments first.</p>
              </div>
            ) : (
              <div className="relative min-h-[400px]">
                {/* Animated Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" style={{ zIndex: 0 }}>
                  <motion.div
                    className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-500 via-blue-500 to-gray-300"
                    initial={{ height: '0%' }}
                    animate={{ 
                      height: `${(selectedOrderForTracking.departmentStatus?.filter(ds => ds.status === 'completed').length || 0) / sortedDepartments.length * 100}%` 
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                
                <div className="space-y-6 pl-20 relative">
                  {sortedDepartments.map((dept, index) => {
                    // Normalize IDs for comparison (handle both string and ObjectId)
                    const deptId = String(dept._id);
                    const currentDeptId = selectedOrderForTracking.currentDepartment 
                      ? String(selectedOrderForTracking.currentDepartment._id || selectedOrderForTracking.currentDepartment)
                      : null;
                    
                    // Get department status from order
                    const deptStatus = selectedOrderForTracking.departmentStatus?.find(
                      ds => {
                        const dsDeptId = ds.department?._id ? String(ds.department._id) : String(ds.department);
                        return dsDeptId === deptId;
                      }
                    );
                    
                    // Check if this is the current department
                    const isCurrentDept = currentDeptId === deptId;
                    const isCompleted = deptStatus?.status === 'completed';
                    const isBlocked = deptStatus?.status === 'blocked';
                    const isInProgress = deptStatus?.status === 'in_progress' || isCurrentDept;
                    const isActive = isCurrentDept || isInProgress;
                    
                    // Get pending message for this department
                    const pendingMsg = selectedOrderForTracking.pendingMessages?.find(
                      pm => {
                        const pmDeptId = pm.department?._id ? String(pm.department._id) : String(pm.department);
                        return pmDeptId === deptId && !pm.resolvedAt;
                      }
                    );

                    return (
                      <motion.div
                        key={dept._id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.15,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="relative flex items-start gap-4 mb-6"
                        style={{ zIndex: 10, minHeight: '80px' }}
                      >
                        {/* Animated Status Circle */}
                        <div className="relative flex-shrink-0 -ml-14 mt-1" style={{ zIndex: 20 }}>
                          <motion.div
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center
                              ${isCompleted 
                                ? 'bg-green-500' 
                                : isBlocked
                                ? 'bg-red-500'
                                : isActive 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                              }
                            `}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              delay: index * 0.15 + 0.2,
                              type: "spring",
                              stiffness: 200
                            }}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.15 + 0.3 }}
                              >
                                <FiCheckCircle className="text-white text-xl" />
                              </motion.div>
                            ) : isBlocked ? (
                              <FiXCircle className="text-white text-xl" />
                            ) : isActive ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              >
                                <FiClock className="text-white text-xl" />
                              </motion.div>
                            ) : (
                              <FiPackage className="text-white text-lg" />
                            )}
                          </motion.div>
                          
                          {/* Pulse animation for active */}
                          {isActive && !isCompleted && !isBlocked && (
                            <motion.div
                              className={`absolute inset-0 rounded-full bg-blue-500`}
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}
                        </div>

                        {/* Department Info Card */}
                        <motion.div
                          className={`
                            flex-1 p-5 rounded-lg border-l-4 transition-all duration-300
                            ${isCompleted 
                              ? 'bg-green-50 border-green-500 shadow-sm' 
                              : isBlocked
                              ? 'bg-red-50 border-red-500 shadow-md'
                              : isActive 
                              ? 'bg-blue-50 border-blue-500 shadow-md' 
                              : 'bg-gray-50 border-gray-300'
                            }
                          `}
                          whileHover={{ scale: 1.01, x: 2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{ zIndex: 15, marginBottom: '0' }}
                        >
                          <div className="flex items-start justify-between gap-4 w-full">
                            <div className="flex-1 min-w-0">
                              <h4 className={`
                                text-lg font-semibold mb-1
                                ${isCompleted ? 'text-green-800' : isBlocked ? 'text-red-800' : isActive ? 'text-blue-800' : 'text-gray-600'}
                              `}>
                                {dept.name}
                              </h4>
                              <div className="flex items-center gap-3 flex-wrap">
                                {isCompleted ? (
                                  <motion.span
                                    className="text-sm text-green-700 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.15 + 0.4 }}
                                  >
                                    ✓ Completed
                                  </motion.span>
                                ) : isBlocked ? (
                                  <motion.span
                                    className="text-sm text-red-700 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    ⚠ Pending
                                  </motion.span>
                                ) : isActive ? (
                                  <motion.span
                                    className="text-sm text-blue-700 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ 
                                      duration: 1.5,
                                      repeat: Infinity,
                                      delay: index * 0.15
                                    }}
                                  >
                                    In Progress...
                                  </motion.span>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    Pending
                                  </span>
                                )}
                                {pendingMsg && (
                                  <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                    <p className="font-medium">Pending: {pendingMsg.message}</p>
                                    {pendingMsg.resolvedAt && (
                                      <p className="text-green-600 mt-1">Resolved: {pendingMsg.resolvedMessage}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* Show OK/Pending buttons for current department */}
                              {(() => {
                                // Show buttons if this is the current department and order is accepted
                                if (isCurrentDept && selectedOrderForTracking.status === 'accepted') {
                                  return (
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                      {isBlocked ? (
                                        <motion.button
                                          onClick={handleResolvePending}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          Resolve & Continue
                                        </motion.button>
                                      ) : (
                                        <>
                                          <motion.button
                                            onClick={() => handleMoveToNext(selectedOrderForTracking.orderId)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            OK
                                          </motion.button>
                                          <motion.button
                                            onClick={() => handleMarkPending(dept)}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            Pending
                                          </motion.button>
                                        </>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            {dept.serialNumber && (
                              <span className={`
                                px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0
                                ${isCompleted 
                                  ? 'bg-green-200 text-green-800' 
                                  : isBlocked
                                  ? 'bg-red-200 text-red-800'
                                  : isActive 
                                  ? 'bg-blue-200 text-blue-800' 
                                  : 'bg-gray-200 text-gray-600'
                                }
                              `}>
                                #{dept.serialNumber}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    // Show accepted orders list
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Orders</h2>
          <p className="text-gray-600 mb-6">Select an order to track its progress through departments</p>
          
          {acceptedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiShoppingBag className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No accepted orders found. Orders will appear here after being accepted by the Accounts department.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <th className="px-6 py-4 text-left border border-gray-200 font-semibold text-gray-700">Order No</th>
                    <th className="px-6 py-4 text-left border border-gray-200 font-semibold text-gray-700">Client Name</th>
                    <th className="px-6 py-4 text-center border border-gray-200 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-blue-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-800">{order.orderId}</td>
                      <td className="px-6 py-4 border border-gray-200 text-gray-700">{order.clientName}</td>
                      <td className="px-6 py-4 border border-gray-200 text-center">
                        <motion.button
                          onClick={() => handleTrackOrder(order)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiTruck className="text-sm" />
                          Track
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const renderDepartments = () => {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Department</h2>
          
          {/* Simple Add Department Form */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateDepartment();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter department name"
              />
              <input
                type="number"
                value={newDepartmentSerialNumber}
                onChange={(e) => setNewDepartmentSerialNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateDepartment();
                  }
                }}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SL No"
                min="1"
              />
              <motion.button
                onClick={handleCreateDepartment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>
            <p className="text-sm text-gray-500">Note: If SL No is not provided, it will be auto-assigned</p>
          </div>

          {/* Departments List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Departments</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading departments...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiBriefcase className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No departments found. Add your first department!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept._id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingDepartmentId === dept._id ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={editingDepartmentName}
                          onChange={(e) => setEditingDepartmentName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateDepartment(dept._id);
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={editingDepartmentSerialNumber}
                          onChange={(e) => setEditingDepartmentSerialNumber(e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SL No"
                          min="1"
                        />
                        <motion.button
                          onClick={() => handleUpdateDepartment(dept._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Save
                        </motion.button>
                        <motion.button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-gray-600 font-medium w-16">SL: {dept.serialNumber || '-'}</span>
                          <span className="text-gray-800 font-medium flex-1">{dept.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleEditDepartment(dept)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteDepartment(dept._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${notification.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          <FiCheckCircle className="mr-2" />
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification({ show: false, message: '', isError: false })}
            className="ml-4"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Mobile header */}
      <div className="md:hidden bg-[#00072D] text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md focus:outline-none hover:bg-white/10 transition-colors"
        >
          {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
        <h1 className="text-xl font-bold">Production Dashboard</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-red-600/20 transition-colors"
        >
          <FiLogOut className="text-xl" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed and not scrolling */}
        <motion.div 
          className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-20 ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#00072D] text-white transition-all duration-200 ease-in-out md:transition-all flex flex-col shadow-2xl`}
          style={{ 
            height: '100vh',
            background: `linear-gradient(180deg, #00072D 0%, #1a1a2e 100%)`
          }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b-2 border-white/20">
            <div className="flex items-center justify-between">
            <motion.button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-2 rounded-lg hover:bg-white/10 transition-all ml-auto"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              {sidebarCollapsed ? <FiMenu className="text-xl" /> : <FiX className="text-xl" />}
            </motion.button>
            </div>
          </div>
          <nav className="mt-6 flex-1 overflow-y-auto px-2">
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all mb-2 ${activeMenu === 'dashboard' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('dashboard');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
              title="Dashboard"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiHome className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </motion.div>
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all mb-2 ${activeMenu === 'master' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('master');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
              title="Master Data"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiDatabase className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Master Data</span>}
            </motion.div>
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all ${activeMenu === 'acceptedOrders' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('acceptedOrders');
                setMobileMenuOpen(false);
                setMasterType(null);
                loadAcceptedOrders();
                loadRejectedOrders();
              }}
              title="Accepted Orders"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiCheckCircle className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Accepted Orders</span>}
            </motion.div>
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all mb-2 ${activeMenu === 'departments' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('departments');
                setMobileMenuOpen(false);
                setMasterType(null);
                fetchDepartments();
              }}
              title="Departments"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiBriefcase className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Departments</span>}
            </motion.div>
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all mb-2 ${activeMenu === 'trackOrder' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('trackOrder');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
              title="Track Order"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiShoppingBag className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Track Order</span>}
            </motion.div>
            <motion.div 
              className={`flex items-center px-4 py-4 cursor-pointer rounded-xl transition-all mb-2 ${activeMenu === 'completedOrders' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('completedOrders');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
              title="Complete Orders"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiCheckCircle className="mr-3 flex-shrink-0 text-lg" />
              {!sidebarCollapsed && <span className="font-medium">Complete Orders</span>}
            </motion.div>
          </nav>
          {!sidebarCollapsed && (
            <div className="p-4 text-xs text-white/40 border-t border-white/10 text-center">
           PageTraffics
          </div>
          )}
        </motion.div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Desktop Header */}
        <motion.div 
          className="hidden md:block fixed top-0 right-0 left-64 bg-[#00072D] text-white p-4 flex justify-between items-center shadow-lg z-10 transition-all duration-200 border-b-2"
          style={{ 
            left: sidebarCollapsed ? '80px' : '256px',
            borderColor: '#f9e79f',
            background: `linear-gradient(90deg, #00072D 0%, #1a1a2e 100%)`
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FiHome className="text-lg" style={{ color: '#f9e79f' }} />
            </div>
            <h1 className="text-xl font-bold tracking-wide" style={{ color: '#f9e79f' }}>Production Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 rounded-lg bg-white/10">
              <span className="text-sm font-medium" style={{ color: '#f9e79f' }}>
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-600/20 transition-all border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: '#f9e79f' }}
            >
              <FiLogOut />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6 md:pt-20">
          {activeMenu === 'dashboard' && renderDashboard()}

          {activeMenu === 'master' && (
            <>
              {!masterType && renderMasterDataMenu()}
              {masterType === 'product' && renderProductMasterForm()}
              {masterType === 'design' && renderDesignMasterForm()}
            </>
          )}

          {activeMenu === 'acceptedOrders' && renderAcceptedOrders()}

          {activeMenu === 'departments' && renderDepartments()}

          {activeMenu === 'trackOrder' && renderTrackOrder()}

          {activeMenu === 'completedOrders' && renderCompletedOrders()}
        </div>
      </div>

      {/* Pending Message Modal */}
      {pendingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Mark Order as Pending</h3>
            <p className="text-sm text-gray-600 mb-4">
              Department: <span className="font-semibold">{selectedDepartmentForAction?.name}</span>
            </p>
            <textarea
              value={pendingMessage}
              onChange={(e) => setPendingMessage(e.target.value)}
              placeholder="Enter reason why this order is pending..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleSubmitPending}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
              <motion.button
                onClick={() => {
                  setPendingModalOpen(false);
                  setPendingMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resolve Pending Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Resolve Pending Issue</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter resolution message (optional):
            </p>
            <textarea
              value={resolveMessage}
              onChange={(e) => setResolveMessage(e.target.value)}
              placeholder="Enter resolution message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleSubmitResolve}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Resolve
              </motion.button>
              <motion.button
                onClick={() => {
                  setResolveModalOpen(false);
                  setResolveMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductionDashboard;