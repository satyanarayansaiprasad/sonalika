import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Table,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Spin,
  Row,
  Col,
  Statistic,
  Divider,
  InputNumber,
  Select,
  Tag,
  DatePicker,
  Modal,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import {
  LayoutDashboard,
  User,
  ShoppingCart,
  History,
  Plus,
  Minus,
  Search,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const { RangePicker } = DatePicker;
const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Color palette
const colors = {
  gold: "#f9e79f",
  darkGold: "#050d3f",
  roseGold: "#B76E79",
  platinum: "#E5E4E2",
  deepNavy: "#050d3f",
  velvet: "#050d3f",
  light: "#F8F8F8",
  diamond: "rgba(255,255,255,0.9)",
};

// Mobile detection hook
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return isMobile;
};

const SalesDashboard = () => {
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [orderItems, setOrderItems] = useState([{ 
    srNo: 1,
    styleNo: "",
    diamondClarity: "",
    diamondColor: "",
    quantity: 1,
    grossWeight: 0,
    netWeight: 0,
    diaWeight: 0,
    pcs: 1,
    amount: 0,
    description: ""
  }]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  
  const [modalClient, setModalClient] = useState(null);
  const [ongoingOrderModalVisible, setOngoingOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // KYC Form Submit Handler
  const handleKYCSubmit = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        name: values.name,
        phone: values.phone,
        mobile: values.mobile,
        officePhone: values.officePhone,
        landline: values.landline,
        email: values.email,
        address: values.address,
        gstNo: values.gstNo,
        companyPAN: values.companyPAN,
        ownerPAN: values.ownerPAN,
        aadharNumber: values.aadharNumber,
        importExportCode: values.importExportCode
      };

      const response = await axios.post(`${API_BASE_URL}/api/team/create-client`, payload);

      if (response.data.success) {
        message.success("Client KYC submitted successfully");
        kycForm.resetFields();
        fetchClients();
      } else {
        message.error(response.data.message || "Failed to submit KYC");
      }
    } catch (error) {
      console.error("KYC Submission Error:", error);
      
      if (error.response) {
        if (error.response.status === 400) {
          message.error(
            error.response.data.message ||
              "Validation failed. Please check your inputs."
          );
        } else {
          message.error(error.response.data.error || "KYC submission failed");
        }
      } else {
        message.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate Aadhar Number
  const validateAadhar = (_, value) => {
    if (!value) return Promise.resolve();
    if (/^\d{12}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Aadhar number must be 12 digits'));
  };

  // Validate GST Number
  const validateGST = (_, value) => {
    if (!value) return Promise.resolve();
    if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Invalid GST number format'));
  };

  // Validate PAN Number
  const validatePAN = (_, value) => {
    if (!value) return Promise.resolve();
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Invalid PAN format (e.g. ABCDE1234F)'));
  };

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch clients');
      }

      const clientData = res.data.clients.map(client => ({
        _id: client._id,
        name: client.name || 'No Name',
        uniqueId: client.uniqueId || '',
        phone: client.phone || '',
        mobile: client.mobile || '',
        officePhone: client.officePhone || '',
        landline: client.landline || '',
        email: client.email || '',
        address: client.address || '',
        gstNo: client.gstNo || '',
        companyPAN: client.companyPAN || '',
        ownerPAN: client.ownerPAN || '',
        aadharNumber: client.aadharNumber || '',
        importExportCode: client.importExportCode || '',
        orders: (client.orders || []).map(order => ({
          orderId: order.orderId || '',
          orderDate: order.orderDate ? new Date(order.orderDate) : null,
          status: order.status || '',
          orderItems: (order.orderItems || []).map(item => ({
            srNo: item.srNo || 0,
            styleNo: item.styleNo || '',
            diamondClarity: item.diamondClarity || '',
            diamondColor: item.diamondColor || '',
            quantity: item.quantity || 0,
            grossWeight: item.grossWeight || 0,
            netWeight: item.netWeight || 0,
            diaWeight: item.diaWeight || 0,
            pcs: item.pcs || 0,
            amount: item.amount || 0,
            description: item.description || ''
          }))
        })),
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }));

      setClients(clientData);
      calculateStats(clientData);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error(err.message || "Failed to fetch clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientData) => {
    let totalOrders = 0;
    let totalRevenue = 0;
    const activeClients = new Set();

    clientData.forEach((client) => {
      const orders = client.orders || [];
      orders.forEach((order) => {
        totalOrders++;
        const orderTotal = order.orderItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalRevenue += orderTotal;
        
        if (order.status === "ongoing") {
          activeClients.add(client._id);
        }
      });
    });

    setStats({
      totalClients: clientData.length,
      activeClients: activeClients.size,
      totalOrders,
      totalRevenue,
    });
  };

  const handleClientClick = (client) => {
    setModalClient(client);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOngoingOrderModalVisible(true);
  };

  const closeModal = () => {
    setModalClient(null);
  };

  const closeOrderModal = () => {
    setOngoingOrderModalVisible(false);
    setSelectedOrder(null);
  };

  const handleOrderSubmit = async () => {
    try {
      setLoading(true);

      if (!selectedClient.uniqueId) {
        message.error("Please select a client");
        return;
      }

      if (!orderItems || orderItems.length === 0) {
        message.error("Please add at least one order item");
        return;
      }

      const invalidItems = orderItems
        .map((item, index) => {
          const errors = [];
          if (!item.styleNo?.trim()) errors.push("Style No is required");
          if (!item.pcs || isNaN(item.pcs)) errors.push("PCS must be a number");
          if (item.pcs < 1) errors.push("PCS must be at least 1");
          if (!item.amount || isNaN(item.amount))
            errors.push("Amount must be a number");
          if (item.amount <= 0) errors.push("Amount must be greater than 0");

          return errors.length > 0 ? { itemIndex: index, errors } : null;
        })
        .filter(Boolean);

      if (invalidItems.length > 0) {
        message.error({
          content: (
            <div>
              <p>Please fix the following errors:</p>
              <ul>
                {invalidItems.map((item, idx) => (
                  <li key={idx}>
                    <strong>Item {item.itemIndex + 1}:</strong>{" "}
                    {item.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ),
          duration: 10,
        });
        return;
      }

      const payload = {
        clientId: selectedClient._id,
        orderItems: orderItems.map((item) => ({
          srNo: item.srNo || 0,
          styleNo: item.styleNo.trim(),
          diamondClarity: item.diamondClarity?.trim() || "",
          diamondColor: item.diamondColor?.trim() || "",
          quantity: item.quantity || 1,
          grossWeight: item.grossWeight || 0,
          netWeight: item.netWeight || 0,
          diaWeight: item.diaWeight || 0,
          pcs: item.pcs,
          amount: item.amount,
          description: item.description?.trim() || "",
        })),
      };

      const response = await axios.post(`${API_BASE_URL}/api/team/client-orders`, payload);

      if (response.data.success) {
        message.success("Order created successfully");
        orderForm.resetFields();
        setOrderItems([{ 
          srNo: 1,
          styleNo: "",
          diamondClarity: "",
          diamondColor: "",
          quantity: 1,
          grossWeight: 0,
          netWeight: 0,
          diaWeight: 0,
          pcs: 1,
          amount: 0,
          description: ""
        }]);
        fetchClients();
      } else {
        message.error(response.data.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Order Error:", err);
      
      if (err.response) {
        if (err.response.status === 400) {
          message.error(
            err.response.data.message ||
              "Validation failed. Please check your inputs."
          );
        } else if (err.response.status === 404) {
          message.error(err.response.data.message || "Client not found");
        } else {
          message.error(err.response.data.error || "Order creation failed");
        }
      } else {
        message.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async (uniqueId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/team/client-orders/${uniqueId}`);
      
      if (response.data.success) {
        const formattedHistory = response.data.orders.map(order => ({
          ...order,
          orderId: order._id,
          orderDate: order.createdAt,
          client: {
            name: selectedClient.name,
            phone: selectedClient.phone,
            gstNo: selectedClient.gstNo
          }
        }));
        
        setOrderHistory(formattedHistory);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("History Error:", err);
      message.error("Failed to fetch order history");
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev, 
      { 
        srNo: prev.length + 1,
        styleNo: "",
        diamondClarity: "",
        diamondColor: "",
        quantity: 1,
        grossWeight: 0,
        netWeight: 0,
        diaWeight: 0,
        pcs: 1,
        amount: 0,
        description: ""
      }
    ]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length <= 1) {
      message.warning("At least one order item is required");
      return;
    }
    
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      // Reassign serial numbers
      return newItems.map((item, idx) => ({ ...item, srNo: idx + 1 }));
    });
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-calculate amount if quantity or pcs changes
      if (field === 'quantity' || field === 'pcs') {
        const quantity = newItems[index].quantity || 1;
        const pcs = newItems[index].pcs || 1;
        newItems[index].amount = quantity * pcs;
      }
      
      return newItems;
    });
  };

  const handleClientSelect = (clientId) => {
    const client = clients.find((c) => c._id === clientId);
    setSelectedClient(client || null);
    if (selectedMenu === "history" && client) {
      fetchOrderHistory(client._id);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const ClientModal = ({ client, onClose }) => {
    if (!client) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ border: `2px solid ${colors.darkGold}` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.velvet }}>
                  {client.name}
                </h3>
                <p className="text-sm" style={{ color: colors.darkGold }}>
                  {client.uniqueId}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
           
            <div className="space-y-3">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-gray-700">{client.phone}</span>
              </div>

              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-700">{client.address}</span>
              </div>

              {client.gstNo && (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-gray-700">GST: {client.gstNo}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Order Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: colors.gold }}
                >
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-lg font-bold" style={{ color: colors.velvet }}>
                    {client.orders ? client.orders.length : 0}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: colors.roseGold }}
                >
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-lg font-bold" style={{ color: colors.light }}>
                    {client.orders
                      ? client.orders.filter(o => o.status === "ongoing").length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const OngoingOrderModal = ({ orderId, visible, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (visible && orderId) {
        fetchOrderDetails(orderId);
      }
    }, [visible, orderId]);

    const fetchOrderDetails = async (id) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/team/order-details/${id}`);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          throw new Error(response.data.message || "Failed to load order");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (!visible) return null;

    return (
      <Modal
        title={`Order Details - ${orderId ? orderId.substring(0, 8) + '...' : 'N/A'}`}
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={isMobile ? '90%' : 800}
        style={{ top: 20 }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : order ? (
          <div className="space-y-4 p-6">
            {isMobile ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {order.client?.name || "N/A"}</p>
                    <p><span className="font-medium">Phone:</span> {order.client?.phone || "N/A"}</p>
                    <p><span className="font-medium">GST:</span> {order.client?.gstNo || "N/A"}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {orderId.substring(0, 8)}...</p>
                    <p><span className="font-medium">Date:</span> {dayjs(order.orderDate).format("DD/MM/YYYY")}</p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <Tag className="ml-2" style={{ 
                        backgroundColor: order.status === "completed" ? "#e6f7ee" : "#e6f4ff",
                        color: order.status === "completed" ? "#08965b" : colors.darkGold
                      }}>
                        {order.status?.toUpperCase() || "UNKNOWN"}
                      </Tag>
                    </p>
                    <p>
                      <span className="font-medium">Total Amount:</span> ₹
                      {order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  {order.orderItems?.length > 0 ? (
                    <div className="space-y-4">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-b-0">
                          <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-medium">SR No:</span> {item.srNo}</p>
                            <p><span className="font-medium">Style No:</span> {item.styleNo}</p>
                            <p><span className="font-medium">Clarity:</span> {item.diamondClarity || "N/A"}</p>
                            <p><span className="font-medium">Color:</span> {item.diamondColor || "N/A"}</p>
                            <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                            <p><span className="font-medium">PCS:</span> {item.pcs}</p>
                            <p><span className="font-medium">Amount:</span> ₹{item.amount}</p>
                          </div>
                          {item.description && (
                            <p className="mt-2"><span className="font-medium">Description:</span> {item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No order items found</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.platinum }}>
                  <h4 className="font-medium mb-2" style={{ color: colors.velvet }}>
                    Client Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {order.client?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {order.client?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">GST:</span>{" "}
                      {order.client?.gstNo || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.platinum }}>
                  <h4 className="font-medium mb-2" style={{ color: colors.velvet }}>
                    Order Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Order ID:</span> {orderId.substring(0, 8)}...
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {dayjs(order.orderDate).format("DD/MM/YYYY")}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <Tag
                        className={`ml-2 ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status?.toUpperCase() || "UNKNOWN"}
                      </Tag>
                    </p>
                    <p>
                      <span className="font-medium">Total Amount:</span> ₹
                      {order.orderItems
                        ?.reduce(
                          (sum, item) => sum + (item.amount || 0),
                          0
                        )
                        .toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isMobile && (
              <>
                <Divider style={{ borderColor: colors.darkGold }}>
                  Order Items
                </Divider>

                {order.orderItems?.length > 0 ? (
                  <Table
                    columns={[
                      {
                        title: "SR No",
                        dataIndex: "srNo",
                        key: "srNo",
                        render: (text) => (
                          <span className="text-gray-700">{text}</span>
                        ),
                      },
                      {
                        title: "Style No",
                        dataIndex: "styleNo",
                        key: "styleNo",
                        render: (text) => (
                          <span className="font-medium">{text}</span>
                        ),
                      },
                      {
                        title: "Clarity",
                        dataIndex: "diamondClarity",
                        key: "clarity",
                        render: (text) => (
                          <span className="text-gray-600">{text || "N/A"}</span>
                        ),
                      },
                      {
                        title: "Color",
                        dataIndex: "diamondColor",
                        key: "color",
                        render: (text) => (
                          <span className="text-gray-600">{text || "N/A"}</span>
                        ),
                      },
                      {
                        title: "Quantity",
                        dataIndex: "quantity",
                        key: "quantity",
                        render: (text) => (
                          <span className="font-medium">{text}</span>
                        ),
                      },
                      {
                        title: "PCS",
                        dataIndex: "pcs",
                        key: "pcs",
                        render: (text) => (
                          <span className="font-medium">{text}</span>
                        ),
                      },
                      {
                        title: "Amount",
                        dataIndex: "amount",
                        key: "amount",
                        render: (text) => (
                          <span className="font-medium">
                            ₹{Number(text).toFixed(2)}
                          </span>
                        ),
                      },
                      {
                        title: "Description",
                        dataIndex: "description",
                        key: "description",
                        render: (text) => (
                          <span className="text-gray-600">{text || "N/A"}</span>
                        ),
                      },
                    ]}
                    dataSource={order.orderItems}
                    rowKey={(record) => `${record.srNo}-${record.styleNo}`}
                    pagination={false}
                    size="small"
                    bordered
                  />
                ) : (
                  <div className="text-center py-4">
                    <p style={{ color: colors.velvet }}>No order items found</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p style={{ color: colors.velvet }}>Order not found</p>
          </div>
        )}
      </Modal>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold" style={{ color: colors.velvet }}>
        Sales Dashboard
      </h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="rounded-lg shadow p-4 border"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <Statistic
            title={<span className="text-gray-600">Total Clients</span>}
            value={stats.totalClients}
            valueStyle={{ color: colors.velvet, fontSize: "24px" }}
          />
        </div>
        <div
          className="rounded-lg shadow p-4 border"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.roseGold,
          }}
        >
          <Statistic
            title={<span className="text-gray-600">Active Clients</span>}
            value={stats.activeClients}
            valueStyle={{ color: colors.roseGold, fontSize: "24px" }}
          />
        </div>
        <div
          className="rounded-lg shadow p-4 border"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <Statistic
            title={<span className="text-gray-600">Total Orders</span>}
            value={stats.totalOrders}
            valueStyle={{ color: colors.velvet, fontSize: "24px" }}
          />
        </div>
        
      </div>

      {/* Clients and Orders Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* All Clients */}
        <div
          className="rounded-2xl shadow-sm border p-5"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b pb-2"
            style={{ color: colors.velvet }}
          >
            All Clients
          </h2>
          <Table
            dataSource={clients}
            columns={[
              {
                title: "Unique ID",
                dataIndex: "uniqueId",
                key: "uniqueId",
                render: (text) => (
                  <span
                    className="font-mono font-semibold"
                    style={{ color: colors.darkGold }}
                  >
                    {text}
                  </span>
                ),
              },
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
                render: (_, record) => (
                  <span
                    className="text-gray-800 font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleClientClick(record)}
                    style={{ color: colors.velvet }}
                  >
                    {record.name}
                  </span>
                ),
              },
            ]}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            className="custom-table"
            onRow={(record) => ({
              onClick: () => handleClientClick(record),
              style: { cursor: "pointer", backgroundColor: colors.light },
            })}
          />
        </div>

        {/* Ongoing Orders */}
        <div
          className="rounded-2xl shadow-sm border p-5"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b pb-2"
            style={{ color: colors.velvet }}
          >
            Ongoing Orders
          </h2>
          <Table
            dataSource={clients.flatMap(client => {
              const ongoingOrders = (client.orders || []).filter(order => order.status === "ongoing");
              return ongoingOrders.map(order => ({
                ...order,
                clientName: client.name,
                client
              }));
            })}
            columns={[
              {
                title: "Client",
                dataIndex: "clientName",
                key: "clientName",
                render: (text, record) => (
                  <span
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleClientClick(record.client)}
                    style={{ color: colors.velvet }}
                  >
                    {text}
                  </span>
                ),
              },
              
              
              {
                title: "Status",
                key: "status",
                render: (_, record) => (
                  <Tag
                    style={{ 
                      backgroundColor: "#e6f4ff",
                      color: colors.darkGold
                    }}
                  >
                    ONGOING
                  </Tag>
                ),
              },
              {
                title: "Action",
                key: "action",
                render: (_, record) => (
                  <Button
                    size="small"
                    style={{
                      backgroundColor: colors.platinum,
                      color: colors.darkGold,
                      borderColor: colors.darkGold,
                    }}
                    onClick={() => handleOrderClick(record)}
                  >
                    View Details
                  </Button>
                ),
              },
            ]}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            className="custom-table"
          />
        </div>

        {/* Completed Orders */}
        <div
          className="rounded-2xl shadow-sm border p-5"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b pb-2"
            style={{ color: colors.velvet }}
          >
            Completed Orders
          </h2>
          <Table
            dataSource={clients.flatMap(client => {
              const completedOrders = (client.orders || []).filter(order => order.status === "completed");
              return completedOrders.map(order => ({
                ...order,
                clientName: client.name,
                client
              }));
            })}
            columns={[
              {
                title: "Client",
                dataIndex: "clientName",
                key: "clientName",
                render: (text, record) => (
                  <span
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleClientClick(record.client)}
                    style={{ color: colors.velvet }}
                  >
                    {text}
                  </span>
                ),
              },
              {
                title: "Order ID",
                dataIndex: "_id",
                key: "orderId",
                render: (id) => (
                  <span className="font-medium" style={{ color: colors.darkGold }}>
                    {id ? id.substring(0, 8) + "..." : "N/A"}
                  </span>
                ),
              },
              {
                title: "Date",
                dataIndex: "createdAt",
                key: "date",
                render: (date) => (
                  <span className="text-gray-600">
                    {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
                  </span>
                ),
              },
              {
                title: "Items",
                dataIndex: "orderItems",
                key: "items",
                render: (items) => (
                  <span className="font-medium">{items?.length || 0}</span>
                ),
              },
              {
                title: "Amount",
                key: "amount",
                render: (_, record) => (
                  <span className="font-medium">
                    ₹
                    {record.orderItems?.reduce(
                      (sum, item) => sum + (item.amount || 0),
                      0
                    ) || 0}
                  </span>
                ),
              },
              {
                title: "Action",
                key: "action",
                render: (_, record) => (
                  <Button
                    size="small"
                    style={{
                      backgroundColor: colors.platinum,
                      color: colors.darkGold,
                      borderColor: colors.darkGold,
                    }}
                    onClick={() => handleOrderClick(record)}
                  >
                    View Details
                  </Button>
                ),
              },
            ]}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            locale={{
              emptyText: (
                <div className="text-gray-500 text-sm flex flex-col items-center justify-center py-10">
                  <img
                    src="/empty-box-icon.svg"
                    alt="No Data"
                    className="w-12 h-12 mb-2"
                  />
                  <p>No completed orders</p>
                </div>
              ),
            }}
            className="custom-table"
          />
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal client={modalClient} onClose={closeModal} />

      {/* Ongoing Order Modal */}
      <OngoingOrderModal
        orderId={selectedOrder?._id}
        visible={ongoingOrderModalVisible}
        onClose={closeOrderModal}
      />
    </div>
  );

  const renderKYCForm = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold" style={{ color: colors.velvet }}>
        Client KYC Form
      </h3>

      <Form
        form={kycForm}
        onFinish={handleKYCSubmit}
        layout="vertical"
        className="rounded-lg shadow p-6 border"
        style={{
          backgroundColor: colors.diamond,
          borderColor: colors.darkGold,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
          {/* Name (Required) */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input
              placeholder="Enter full name"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          {/* Phone (Required) */}
          <Form.Item
            label="Mobile Number"
            name="phone"
            rules={[
              { required: true, message: 'Please enter mobile number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit mobile number' }
            ]}
          >
            <Input
              placeholder="Primary contact number"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
              maxLength={10}
            />
          </Form.Item>

          {/* Alternate Phone (Optional) */}
          <Form.Item
            label="Alternate Phone (Optional)"
            name="mobile"
            rules={[
              { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit mobile number' }
            ]}
          >
            <Input
              placeholder="Secondary contact number"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
              maxLength={10}
            />
          </Form.Item>

          {/* Office Phone (Optional) */}
          <Form.Item
            label="Office Phone (Optional)"
            name="officePhone"
          >
            <Input
              placeholder="Office landline"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          {/* Landline (Optional) */}
          <Form.Item
            label="Landline (Optional)"
            name="landline"
          >
            <Input
              placeholder="Home landline"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          {/* Email (Optional) */}
          <Form.Item
            label="Email (Optional)"
            name="email"
            rules={[
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input
              placeholder="Email address"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          {/* Address (Required) */}
          <Form.Item
            label="Complete Address"
            name="address"
            rules={[{ required: true, message: 'Please enter address' }]}
            className="md:col-span-2"
          >
            <Input.TextArea
              placeholder="Full address with city, state, and pincode"
              rows={3}
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          {/* Business Documentation */}
          <Form.Item
            label="GST Number (Optional)"
            name="gstNo"
            rules={[
              { validator: validateGST }
            ]}
          >
            <Input
              placeholder="22AAAAA0000A1Z5"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            label="Company PAN (Optional)"
            name="companyPAN"
            rules={[
              { validator: validatePAN }
            ]}
          >
            <Input
              placeholder="ABCDE1234F"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            label="Owner PAN (Optional)"
            name="ownerPAN"
            rules={[
              { validator: validatePAN }
            ]}
          >
            <Input
              placeholder="ABCDE1234F"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            label="Aadhar Number (Optional)"
            name="aadharNumber"
            rules={[
              { validator: validateAadhar }
            ]}
          >
            <Input
              placeholder="12-digit number"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
              maxLength={12}
            />
          </Form.Item>

          <Form.Item
            label="Import/Export Code (Optional)"
            name="importExportCode"
          >
            <Input
              placeholder="IEC code"
              style={{ borderColor: colors.darkGold, borderRadius: "6px" }}
            />
          </Form.Item>
        </div>

        <div className="flex justify-end p-5">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: colors.darkGold,
              color: colors.light,
              padding: '8px 24px',
              borderRadius: '6px',
              fontWeight: 'medium'
            }}
          >
            Submit KYC
          </Button>
        </div>
      </Form>

      {/* Client List Table */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4" style={{ color: colors.velvet }}>
          Existing Clients
        </h4>
        <Table
          dataSource={clients}
          columns={[
            {
              title: "Unique ID",
              dataIndex: "uniqueId",
              key: "uniqueId",
              render: (text) => (
                <span className="font-medium" style={{ color: colors.darkGold }}>
                  {text}
                </span>
              ),
            },
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (text) => <span style={{ color: colors.velvet }}>{text}</span>,
            },
            {
              title: "Phone",
              dataIndex: "phone",
              key: "phone",
              render: (text) => <span className="text-gray-600">{text}</span>,
            },
            {
              title: "GST No",
              dataIndex: "gstNo",
              key: "gstNo",
              render: (text) => <span className="text-gray-600">{text || "N/A"}</span>,
            },
            {
              title: "Status",
              key: "status",
              render: (_, client) => {
                const orders = client.orders || [];
                if (orders.length === 0)
                  return (
                    <Tag style={{ backgroundColor: colors.platinum }}>No orders</Tag>
                  );

                const statuses = orders.map(o => o?.status).filter(Boolean);

                if (statuses.includes("ongoing"))
                  return (
                    <Tag style={{ backgroundColor: "#e6f4ff", color: colors.darkGold }}>
                      Active
                    </Tag>
                  );
                if (statuses.every(s => s === "completed"))
                  return (
                    <Tag style={{ backgroundColor: "#e6f7ee", color: "#08965b" }}>
                      Completed
                    </Tag>
                  );
                return (
                  <Tag style={{ backgroundColor: "#fff7e6", color: "#d46b08" }}>
                    Mixed
                  </Tag>
                );
              },
            },
            {
              title: "Action",
              key: "action",
              render: (_, client) => (
                <Button
                  size="small"
                  style={{
                    backgroundColor: colors.platinum,
                    color: colors.darkGold,
                    borderColor: colors.darkGold,
                  }}
                  onClick={() => {
                    setSelectedMenu("history");
                    handleClientSelect(client._id);
                  }}
                >
                  View Orders
                </Button>
              ),
            },
          ]}
          rowKey="_id"
          loading={loading}
          scroll={{ x: true }}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );

  const diamondClarityOptions = [
    "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"
  ];

  const diamondColorOptions = [
    "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  const renderOrderForm = () => (
    <div>
      <h3 className="text-2xl font-semibold" style={{ color: colors.velvet }}>
        Create New Order
      </h3>
      <div
        className="rounded-lg shadow p-6 border"
        style={{
          backgroundColor: colors.diamond,
          borderColor: colors.darkGold,
        }}
      >
        <div className="mb-6">
          <label className="block font-medium mb-2" style={{ color: colors.velvet }}>
            Client
          </label>
          <Select
            showSearch
            placeholder="Select client"
            optionFilterProp="children"
            onChange={handleClientSelect}
            value={selectedClient?._id}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            style={{
              width: "100%",
              borderColor: colors.darkGold,
            }}
            suffixIcon={
              <ChevronDown className="h-4 w-4" style={{ color: colors.darkGold }} />
            }
          >
            {clients.map((client) => (
              <Option key={client._id} value={client._id}>
                {client.uniqueId} 
              </Option>
            ))}
          </Select>
        </div>

        {selectedClient && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor: colors.platinum,
              borderColor: colors.darkGold,
            }}
          >
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: colors.velvet }}>Client:</span>
                  <span style={{ color: colors.deepNavy }}>{selectedClient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: colors.velvet }}>Phone:</span>
                  <span style={{ color: colors.deepNavy }}>{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: colors.velvet }}>GST:</span>
                  <span style={{ color: colors.deepNavy }}>{selectedClient.gstNo || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: colors.velvet }}>Address:</span>
                  <span style={{ color: colors.deepNavy }}>{selectedClient.address}</span>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-medium p-1" style={{ color: colors.velvet }}>
                      Client:
                    </td>
                    <td className="p-1" style={{ color: colors.deepNavy }}>
                      {selectedClient.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium p-1" style={{ color: colors.velvet }}>
                      Phone:
                    </td>
                    <td className="p-1" style={{ color: colors.deepNavy }}>
                      {selectedClient.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium p-1" style={{ color: colors.velvet }}>
                      GST:
                    </td>
                    <td className="p-1" style={{ color: colors.deepNavy }}>
                      {selectedClient.gstNo || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium p-1" style={{ color: colors.velvet }}>
                      Address:
                    </td>
                    <td className="p-1" style={{ color: colors.deepNavy }}>
                      {selectedClient.address}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}

        <h4
          className="text-lg font-medium mb-4 pb-2"
          style={{
            color: colors.velvet,
            borderBottom: `1px solid ${colors.darkGold}`,
          }}
        >
          Order Items
        </h4>

        {isMobile ? (
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4"
                style={{ borderColor: colors.darkGold }}
              >
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>SR No</label>
                    <InputNumber
                      value={item.srNo}
                      onChange={(val) => updateOrderItem(index, "srNo", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      min={1}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Style No*</label>
                    <Input
                      value={item.styleNo}
                      onChange={(e) => updateOrderItem(index, "styleNo", e.target.value)}
                      placeholder="Style number"
                      style={{ width: '100%', borderColor: colors.darkGold }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Diamond Clarity</label>
                    <Select
                      value={item.diamondClarity}
                      onChange={(val) => updateOrderItem(index, "diamondClarity", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      placeholder="Select clarity"
                    >
                      {diamondClarityOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Diamond Color</label>
                    <Select
                      value={item.diamondColor}
                      onChange={(val) => updateOrderItem(index, "diamondColor", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      placeholder="Select color"
                    >
                      {diamondColorOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Quantity</label>
                    <InputNumber
                      value={item.quantity}
                      onChange={(val) => updateOrderItem(index, "quantity", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      min={1}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>PCS*</label>
                    <InputNumber
                      value={item.pcs}
                      onChange={(val) => updateOrderItem(index, "pcs", val)}
                      style={{
                        width: '100%',
                        borderColor: !item.pcs || item.pcs < 1 ? colors.roseGold : colors.darkGold,
                      }}
                      min={1}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Gross WT</label>
                    <InputNumber
                      value={item.grossWeight}
                      onChange={(val) => updateOrderItem(index, "grossWeight", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Net WT</label>
                    <InputNumber
                      value={item.netWeight}
                      onChange={(val) => updateOrderItem(index, "netWeight", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>DIA WT</label>
                    <InputNumber
                      value={item.diaWeight}
                      onChange={(val) => updateOrderItem(index, "diaWeight", val)}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Amount*</label>
                    <InputNumber
                      value={item.amount}
                      onChange={(val) => updateOrderItem(index, "amount", val)}
                      style={{
                        width: '100%',
                        borderColor: !item.amount || item.amount <= 0 ? colors.roseGold : colors.darkGold,
                      }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-medium" style={{ color: colors.velvet }}>Description</label>
                    <Input.TextArea
                      value={item.description}
                      onChange={(e) => updateOrderItem(index, "description", e.target.value)}
                      rows={2}
                      style={{ width: '100%', borderColor: colors.darkGold }}
                      placeholder={`Description for item ${index + 1}`}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      danger
                      icon={<Minus className="h-4 w-4" />}
                      onClick={() => removeOrderItem(index)}
                      style={{
                        backgroundColor: colors.platinum,
                        color: colors.roseGold,
                        borderColor: colors.roseGold,
                      }}
                    >
                      Remove Item
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table
            className="w-full mb-4"
            style={{ border: `1px solid ${colors.darkGold}` }}
          >
            <thead>
              <tr style={{ backgroundColor: colors.platinum }}>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  SR No
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Style No*
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                 Diamond Clarity
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                 Diamond Color
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  PCS*
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Quantity
                </th>
                
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Gross WT
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Net WT
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  DIA WT
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Amount*
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Description
                </th>
                <th className="p-2 text-left font-medium border" style={{ borderColor: colors.darkGold, color: colors.velvet }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr
                  key={index}
                  className="border"
                  style={{
                    borderColor: colors.darkGold,
                    backgroundColor: colors.light,
                  }}
                >
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.srNo}
                      onChange={(val) => updateOrderItem(index, "srNo", val)}
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      min={1}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <Input
                      value={item.styleNo}
                      onChange={(e) =>
                        updateOrderItem(index, "styleNo", e.target.value)
                      }
                      placeholder="Style number"
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <Select
                      value={item.diamondClarity}
                      onChange={(val) => updateOrderItem(index, "diamondClarity", val)}
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      placeholder="Select clarity"
                    >
                      {diamondClarityOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <Select
                      value={item.diamondColor}
                      onChange={(val) => updateOrderItem(index, "diamondColor", val)}
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      placeholder="Select color"
                    >
                      {diamondColorOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.quantity}
                      onChange={(val) =>
                        updateOrderItem(index, "quantity", val)
                      }
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      min={1}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.pcs}
                      onChange={(val) => updateOrderItem(index, "pcs", val)}
                      style={{
                        width: "100%",
                        borderColor:
                          !item.pcs || item.pcs < 1
                            ? colors.roseGold
                            : colors.darkGold,
                      }}
                      min={1}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.grossWeight}
                      onChange={(val) =>
                        updateOrderItem(index, "grossWeight", val)
                      }
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      min={0}
                      step={0.01}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.netWeight}
                      onChange={(val) => updateOrderItem(index, "netWeight", val)}
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      min={0}
                      step={0.01}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.diaWeight}
                      onChange={(val) => updateOrderItem(index, "diaWeight", val)}
                      style={{
                        width: "100%",
                        borderColor: colors.darkGold,
                      }}
                      min={0}
                      step={0.01}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <InputNumber
                      value={item.amount}
                      onChange={(val) => updateOrderItem(index, "amount", val)}
                      style={{
                        width: "100%",
                        borderColor:
                          !item.amount || item.amount <= 0
                            ? colors.roseGold
                            : colors.darkGold,
                      }}
                      min={0}
                      step={0.01}
                    />
                  </td>
                  <td className="p-2 border" style={{ borderColor: colors.darkGold }}>
                    <Input.TextArea
                      value={item.description}
                      onChange={(e) => updateOrderItem(index, "description", e.target.value)}
                      rows={2}
                      style={{ width: "100%", borderColor: colors.darkGold }}
                      placeholder={`Description for item ${index + 1}`}
                    />
                  </td>
                  <td className="p-2 border text-center" style={{ borderColor: colors.darkGold }}>
                    <Button
                      danger
                      icon={<Minus className="h-4 w-4" />}
                      onClick={() => removeOrderItem(index)}
                      style={{
                        backgroundColor: colors.platinum,
                        color: colors.roseGold,
                        borderColor: colors.roseGold,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-between items-center mt-4">
          <Button
            type="dashed"
            onClick={addOrderItem}
            icon={<Plus className="h-4 w-4" />}
            style={{
              borderColor: colors.darkGold,
              color: colors.darkGold,
              borderStyle: "dashed",
            }}
          >
            Add Item
          </Button>

          <Button
            type="primary"
            onClick={handleOrderSubmit}
            loading={loading}
            style={{
              backgroundColor: colors.darkGold,
              color: colors.light,
              border: "none",
              fontWeight: "medium",
              padding: "8px 24px",
              borderRadius: "6px",
            }}
          >
            Create Order
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold" style={{ color: colors.velvet }}>
        Order History
      </h3>
      <div
        className="rounded-lg shadow p-6 border"
        style={{
          backgroundColor: colors.diamond,
          borderColor: colors.darkGold,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            style={{
              width: "100%",
              borderColor: colors.darkGold,
            }}
            placeholder="Search client"
            value={selectedClient?._id}
            onChange={(clientId) => {
              handleClientSelect(clientId);
            }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            suffixIcon={
              <Search className="h-4 w-4" style={{ color: colors.darkGold }} />
            }
          >
            {clients.map((client) => (
              <Option key={client._id} value={client._id}>
                {client.uniqueId} - {client.name}
              </Option>
            ))}
          </Select>
        </div>

        {selectedClient ? (
          isMobile ? (
            <div className="space-y-4">
              {orderHistory.length > 0 ? (
                orderHistory.map((order) => (
                  <div 
                    key={order._id} 
                    className="border rounded-lg p-4"
                    style={{ borderColor: colors.darkGold }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Order ID:</span>
                        <span>{order._id?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{dayjs(order.orderDate).format("DD MMM YYYY")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Tag
                          style={{ 
                            backgroundColor: order.status === "completed" ? "#e6f7ee" : "#e6f4ff",
                            color: order.status === "completed" ? "#08965b" : colors.darkGold
                          }}
                        >
                          {order.status?.toUpperCase() || "UNKNOWN"}
                        </Tag>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Items:</span>
                        <span>{order.orderItems?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Amount:</span>
                        <span>
                          ₹{order.orderItems?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p>No orders found for this client</p>
                </div>
              )}
            </div>
          ) : (
            <Table
              bordered
              dataSource={orderHistory}
              rowKey="_id"
              size="middle"
              pagination={{ pageSize: 5 }}
              style={{ marginTop: "1.5rem" }}
              onRow={(record) => ({
                onClick: () => handleOrderClick(record),
              })}
              columns={[
                {
                  title: "Order ID",
                  dataIndex: "_id",
                  key: "orderId",
                  render: (id) => (
                    <span style={{ color: colors.darkGold, fontWeight: 600 }}>
                      {id?.slice(0, 8)}...
                    </span>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "orderDate",
                  key: "orderDate",
                  render: (date) => dayjs(date).format("DD MMM YYYY"),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => (
                    <Tag
                      style={{ 
                        backgroundColor: status === "completed" ? "#e6f7ee" : "#e6f4ff",
                        color: status === "completed" ? "#08965b" : colors.darkGold
                      }}
                    >
                      {status?.toUpperCase() || "UNKNOWN"}
                    </Tag>
                  ),
                },
                {
                  title: "Items",
                  dataIndex: "orderItems",
                  key: "items",
                  render: (items) => items?.length || 0,
                },
                {
                  title: "Total Amount (₹)",
                  key: "amount",
                  render: (_, record) =>
                    record.orderItems?.reduce(
                      (sum, i) => sum + (i.amount || 0),
                      0
                    ) || 0,
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Button
                      type="link"
                      onClick={() => handleOrderClick(record)}
                      style={{ color: colors.darkGold }}
                    >
                      View Details
                    </Button>
                  ),
                },
              ]}
            />
          )
        ) : (
          <div className="text-center py-4">
            <p>Please select a client to view order history</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return renderDashboard();
      case "kyc":
        return renderKYCForm();
      case "order":
        return renderOrderForm();
      case "history":
        return renderOrderHistory();
      default:
        return renderDashboard();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className="w-64 text-white flex-shrink-0 hidden md:block"
        style={{ backgroundColor: colors.deepNavy }}
      >
        <div
          className="h-16 flex items-center justify-center border-b"
          style={{ borderColor: colors.darkGold }}
        >
          <span className="text-xl font-bold" style={{ color: colors.gold }}>
            SONALIKA JEWELLERS
          </span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedMenu("dashboard")}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === "dashboard"
                    ? "bg-opacity-20"
                    : "text-gray-300 hover:bg-opacity-10"
                }`}
                style={{
                  backgroundColor:
                    selectedMenu === "dashboard" ? colors.gold : "transparent",
                  color:
                    selectedMenu === "dashboard"
                      ? colors.deepNavy
                      : colors.platinum,
                }}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("kyc")}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === "kyc"
                    ? "bg-opacity-20"
                    : "text-gray-300 hover:bg-opacity-10"
                }`}
                style={{
                  backgroundColor:
                    selectedMenu === "kyc" ? colors.gold : "transparent",
                  color:
                    selectedMenu === "kyc" ? colors.deepNavy : colors.platinum,
                }}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Client KYC</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("order")}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === "order"
                    ? "bg-opacity-20"
                    : "text-gray-300 hover:bg-opacity-10"
                }`}
                style={{
                  backgroundColor:
                    selectedMenu === "order" ? colors.gold : "transparent",
                  color:
                    selectedMenu === "order"
                      ? colors.deepNavy
                      : colors.platinum,
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                <span>Create Order</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("history")}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === "history"
                    ? "bg-opacity-20"
                    : "text-gray-300 hover:bg-opacity-10"
                }`}
                style={{
                  backgroundColor:
                    selectedMenu === "history" ? colors.gold : "transparent",
                  color:
                    selectedMenu === "history"
                      ? colors.deepNavy
                      : colors.platinum,
                }}
              >
                <History className="h-5 w-5 mr-3" />
                <span>Order History</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <header
          className="shadow-sm h-16 flex items-center justify-between px-4"
          style={{ backgroundColor: colors.deepNavy }}
        >
          <h4 className="text-lg font-semibold" style={{ color: colors.gold }}>
            Jewelry Sales
          </h4>
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-md focus:outline-none"
          >
            <MenuIcon className="h-6 w-6" style={{ color: colors.gold }} />
          </button>
        </header>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuVisible && (
        <div className="md:hidden fixed inset-0 z-40 mt-16">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div
            className="absolute left-0 top-0 bottom-0 w-64"
            style={{ backgroundColor: colors.deepNavy }}
          >
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu("dashboard");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === "dashboard"
                        ? "bg-opacity-20"
                        : "text-gray-300 hover:bg-opacity-10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedMenu === "dashboard"
                          ? colors.gold
                          : "transparent",
                      color:
                        selectedMenu === "dashboard"
                          ? colors.deepNavy
                          : colors.platinum,
                    }}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu("kyc");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === "kyc"
                        ? "bg-opacity-20"
                        : "text-gray-300 hover:bg-opacity-10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedMenu === "kyc" ? colors.gold : "transparent",
                      color:
                        selectedMenu === "kyc"
                          ? colors.deepNavy
                          : colors.platinum,
                    }}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Client KYC</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu("order");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === "order"
                        ? "bg-opacity-20"
                        : "text-gray-300 hover:bg-opacity-10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedMenu === "order" ? colors.gold : "transparent",
                      color:
                        selectedMenu === "order"
                          ? colors.deepNavy
                          : colors.platinum,
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    <span>Create Order</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu("history");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === "history"
                        ? "bg-opacity-20"
                        : "text-gray-300 hover:bg-opacity-10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedMenu === "history"
                          ? colors.gold
                          : "transparent",
                      color:
                        selectedMenu === "history"
                          ? colors.deepNavy
                          : colors.platinum,
                    }}
                  >
                    <History className="h-5 w-5 mr-3" />
                    <span>Order History</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden md:mt-0 mt-16">
        {/* Desktop Header */}
        <header
          className="shadow-sm z-10 border-b hidden md:block"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <div className="flex items-center justify-between bg-[#050d3f] h-16 px-6">
            <h4
              className="text-lg font-semibold"
              style={{ color: colors.velvet  }}
            >
              Sales Dashboard
            </h4>
            <div className="flex items-center space-x-4">
              <span style={{ color: colors.velvet }}>
                {dayjs().format("DD MMM YYYY")}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ backgroundColor: colors.light }}
        >
          <div
            className="rounded-lg shadow p-4 md:p-6 min-h-[calc(100vh-8rem)] border"
            style={{
              backgroundColor: colors.diamond,
              borderColor: colors.darkGold,
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                  style={{ borderColor: colors.darkGold }}
                ></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>

      {/* Client Modal */}
      <ClientModal client={modalClient} onClose={closeModal} />

      {/* Ongoing Order Modal */}
      <OngoingOrderModal
        orderId={selectedOrder?._id}
        visible={ongoingOrderModalVisible}
        onClose={closeOrderModal}
      />

      {/* Custom Table Styling */}
      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: ${colors.platinum} !important;
          color: ${colors.velvet} !important;
          font-weight: 600 !important;
          border-bottom: 1px solid ${colors.darkGold} !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${colors.darkGold} !important;
          background-color: ${colors.light};
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: ${colors.platinum} !important;
        }
        .ant-table-expanded-row .custom-table .ant-table-thead > tr > th {
          background-color: ${colors.platinum} !important;
        }
        .ant-table-expanded-row .custom-table .ant-table-tbody > tr > td {
          background-color: ${colors.platinum} !important;
        }
        .ant-picker,
        .ant-input,
        .ant-input-number,
        .ant-select-selector {
          border-color: ${colors.darkGold} !important;
        }
        .ant-picker:hover,
        .ant-input:hover,
        .ant-input-number:hover,
        .ant-select-selector:hover {
          border-color: ${colors.roseGold} !important;
        }
        .ant-btn-primary {
          background-color: ${colors.darkGold} !important;
          border-color: ${colors.darkGold} !important;
        }
        .ant-btn-primary:hover {
          background-color: ${colors.roseGold} !important;
          border-color: ${colors.roseGold} !important;
        }
      `}</style>
    </div>
  );
};

export default SalesDashboard;