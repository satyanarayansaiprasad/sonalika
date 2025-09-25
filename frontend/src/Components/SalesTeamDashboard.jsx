
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
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

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

const API_BASE_URL = 'https://sonalika.onrender.com';

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
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
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
  const [orderItems, setOrderItems] = useState([
    {
      srNo: 1,
      styleNo: "",
      diamondClarity: "",
      diamondColor: "",
      goldPurity: "",
      goldColor: "",  
      quantity: 1,
      grossWeight: 0,
      netWeight: 0,
      diaWeight: 0,
      pcs: 1,
      amount: 0,
      remark: "",
    },
  ]);
  const [design, setDesign] = useState({
  styleNo: '',
  grossWt: 0,
  netWt: 0,
  diaWt: 0,
  diaPcs: 1,
});

  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [styleNumbers, setStyleNumbers] = useState([]);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderDescription, setOrderDescription] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [selectedStyleImages, setSelectedStyleImages] = useState({});
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [modalClient, setModalClient] = useState(null);
  const [ongoingOrderModalVisible, setOngoingOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);






 



  // KYC Form Submit Handler
 const handleKYCSubmit = async (values) => {
  try {
    setLoading(true);

    // Create FormData
    const formData = new FormData();

    // Append text fields
    formData.append("name", values.name);
    formData.append("companyName", values.companyName || "");
    formData.append("phone", values.phone);
    formData.append("mobile", values.mobile || "");
    formData.append("officePhone", values.officePhone || "");
    formData.append("landline", values.landline || "");
    formData.append("email", values.email || "");
    formData.append("address", values.address);
    formData.append("gstNo", values.gstNo || "");
    formData.append("companyPAN", values.companyPAN || "");
    formData.append("ownerPAN", values.ownerPAN || "");
    formData.append("aadharNumber", values.aadharNumber || "");
    formData.append("importExportCode", values.importExportCode || "");
    formData.append("msmeNumber", values.msmeNumber || "");
    
    // New KYC fields
    formData.append("igi", values.igi || "");
    formData.append("huid", values.huid || "");
    formData.append("diamondWeightLazerMarking", values.diamondWeightLazerMarking || "");

    // Append files (from AntD's Upload or normal <input type="file">)
    const fileFields = [
      "gstCertificate",
      "companyPanDoc",
      "aadharDoc",
      "importExportDoc",
      "msmeCertificate",
      "visitingCard",
    ];

    fileFields.forEach((field) => {
      const file = values[field]?.file?.originFileObj;
      if (file) {
        formData.append(field, file);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/team/create-client`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

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
      message.error(error.response.data.message || error.response.data.error);
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
    return Promise.reject(new Error("Aadhar number must be 12 digits"));
  };

  // Validate GST Number
  const validateGST = (_, value) => {
    if (!value) return Promise.resolve();
    if (
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
    ) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Invalid GST number format"));
  };

  // Validate PAN Number
  const validatePAN = (_, value) => {
    if (!value) return Promise.resolve();
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Invalid PAN format (e.g. ABCDE1234F)"));
  };

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch clients");
      }

      const clientData = res.data.clients.map((client) => ({
        _id: client._id,
        name: client.name || "No Name",
        companyName: client.companyName || "N/A",
        msmeNumber: client.msmeNumber || "",
        uniqueId: client.uniqueId || "",
        phone: client.phone || "",
        mobile: client.mobile || "",
        officePhone: client.officePhone || "",
        landline: client.landline || "",
        email: client.email || "",
        address: client.address || "",
        gstNo: client.gstNo || "",
        companyPAN: client.companyPAN || "",
        ownerPAN: client.ownerPAN || "",
        aadharNumber: client.aadharNumber || "",
        importExportCode: client.importExportCode || "",
        orders: client.orders || [],
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
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
        const orderTotal = order.orderItems.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
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

      if (!selectedClientId) {
        message.error("Please select a client");
        return;
      }

      // Expected completion date is optional
      // if (!expectedCompletionDate) {
      //   message.error("Please select expected completion date");
      //   return;
      // }

      if (!orderItems || orderItems.length === 0) {
        message.error("Please add at least one order item");
        return;
      }

      const invalidItems = orderItems
        .map((item, index) => {
          const errors = [];
          if (!item.styleNo?.trim()) errors.push("Style No is required");
          if (!item.pcs || isNaN(item.pcs)) errors.push("PCS must be a number");
          if (item.pcs < 1) errors.push("DIA PCS must be at least 1");

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
        uniqueId: selectedClientId,
        expectedCompletionDate: expectedCompletionDate?.toISOString(),
        totalAmount: orderAmount || null,
        orderDescription: orderDescription?.trim() || "",
        orderItems: orderItems.map((item) => ({
          srNo: item.srNo || 0,
          styleNo: item.styleNo.trim(),
          diamondClarity: item.diamondClarity?.trim() || "",
          diamondColor: item.diamondColor?.trim() || "",
          goldPurity: item.goldPurity?.trim() || "",
          goldColor: item.goldColor?.trim() || "",
          quantity: item.quantity || 1,
          grossWeight: item.grossWeight || 0,
          netWeight: item.netWeight || 0,
          diaWeight: item.diaWeight || 0,
          pcs: item.pcs,
          remark: item.remark?.trim() || "",
        })),
      };

      console.log("Frontend payload being sent:", payload);

      const response = await axios.post(
        `${API_BASE_URL}/api/team/client-orders`,
        payload
      );

      if (response.data.success) {
        message.success("Order created successfully");
        orderForm.resetFields();
        setOrderItems([
          {
            srNo: 1,
            styleNo: "",
            diamondClarity: "",
            diamondColor: "",
            goldPurity: "",
            goldColor: "",
            quantity: 1,
            grossWeight: 0,
            netWeight: 0,
            diaWeight: 0,
            pcs: 1,
            amount: 0,
            remark: "",
          },
        ]);
        setOrderAmount(0);
        setOrderDescription("");
        setExpectedCompletionDate(null);
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
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/order-history/${uniqueId}`);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch client orders");
      }

      const client = res.data;
      if (!client || !client.orders) {
        setOrderHistory([]);
        return;
      }

      // Convert orders to array and transform data
      const ordersArray = client.orders.map((order, index) => ({
        id: order.orderId || `order_${index}`,
        orderId: order.orderId,
        orderDate: order.orderDate ? new Date(order.orderDate) : null,
        status: order.status || "ongoing",
        expectedCompletionDate: order.expectedCompletionDate ? new Date(order.expectedCompletionDate) : null,
        totalAmount: order.totalAmount || 0,
        orderDescription: order.orderDescription || "",
        orderItems: (order.orderItems || []).map((item) => ({
          srNo: item.srNo || 0,
          styleNo: item.styleNo || "",
          diamondClarity: item.diamondClarity || "",
          diamondColor: item.diamondColor || "",
          goldPurity: item.goldPurity || "",
          goldColor: item.goldColor || "",
          quantity: item.quantity || 0,
          grossWeight: item.grossWeight || 0,
          netWeight: item.netWeight || 0,
          diaWeight: item.diaWeight || 0,
          pcs: item.pcs || 0,
          remark: item.remark || item.description || "", // Support both old and new field names
        })),
      }));

      // Sort by date (newest first)
      ordersArray.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      setOrderHistory(ordersArray);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error(err.message || "Failed to fetch order history");
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
        goldPurity: "",
        goldColor: "",
        quantity: 1,
        grossWeight: 0,
        netWeight: 0,
        diaWeight: 0,
        pcs: 1,
        amount: 0,
        remark: "",
      },
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

    // Clean up image state for removed item and reindex remaining images
    setSelectedStyleImages((prev) => {
      const newImages = {};
      Object.keys(prev).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          newImages[keyIndex] = prev[key];
        } else if (keyIndex > index) {
          newImages[keyIndex - 1] = prev[key];
        }
        // Skip the removed item (keyIndex === index)
      });
      return newImages;
    });
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleClientSelect = (uniqueId) => {
    setSelectedClientId(uniqueId);
    if (selectedMenu === "history") {
      fetchOrderHistory(uniqueId);
    }
  };

  // Filter orders based on search term, status filter, and date range
const getFilteredOrders = () => {
  // Use detailed order history data instead of basic client data
  const allOrders = orderHistory;

  return allOrders.filter(order => {
    // Filter by search term (matches unique ID or name)
    const matchesSearch = searchTerm === '' || 
      (order.client?.uniqueId && order.client.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.client?.name && order.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || 
      order.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Filter by date range
    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const orderDate = dayjs(order.orderDate);
      matchesDate = orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
};
  const fetchStyleNumbers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pdmaster/getStyleNumbers`);
      if (res.data.success) {
        setStyleNumbers(res.data.data);
      }
    } catch (err) {
      console.error("Fetch style numbers error:", err);
      message.error("Failed to fetch style numbers");
    }
  };

  // Fetch detailed order history for all clients
  const fetchAllOrderHistory = async () => {
    setLoading(true);
    try {
      const allOrders = [];
      
      // Fetch detailed order history for each client
      for (const client of clients) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/team/order-history/${client.uniqueId}`);
          if (res.data.success && res.data.orders) {
            const clientOrders = res.data.orders.map((order, index) => ({
              id: order.orderId || `order_${index}`,
              orderId: order.orderId,
              orderDate: order.orderDate ? new Date(order.orderDate) : null,
              status: order.status || "ongoing",
              expectedCompletionDate: order.expectedCompletionDate ? new Date(order.expectedCompletionDate) : null,
              totalAmount: order.totalAmount || 0,
              orderDescription: order.orderDescription || "",
              orderItems: (order.orderItems || []).map((item) => ({
                srNo: item.srNo || 0,
                styleNo: item.styleNo || "",
                diamondClarity: item.diamondClarity || "",
                diamondColor: item.diamondColor || "",
                goldPurity: item.goldPurity || "",
                goldColor: item.goldColor || "",
                quantity: item.quantity || 0,
                grossWeight: item.grossWeight || 0,
                netWeight: item.netWeight || 0,
                diaWeight: item.diaWeight || 0,
                pcs: item.pcs || 0,
                remark: item.remark || item.description || "",
              })),
              client: {
                uniqueId: client.uniqueId,
                name: client.name,
                gstNo: client.gstNo,
                address: client.address
              }
            }));
            allOrders.push(...clientOrders);
          }
        } catch (error) {
          console.error(`Failed to fetch orders for client ${client.uniqueId}:`, error);
        }
      }
      
      // Sort by date (newest first)
      allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      setOrderHistory(allOrders);
    } catch (error) {
      console.error("Failed to fetch all order history:", error);
      message.error("Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchStyleNumbers();
  }, []);

  // Fetch detailed order history when history menu is selected
  useEffect(() => {
    if (selectedMenu === "history" && clients.length > 0) {
      fetchAllOrderHistory();
    }
  }, [selectedMenu, clients]);

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
                <h3
                  className="text-xl font-bold"
                  style={{ color: colors.velvet }}
                >
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
                  <p
                    className="text-lg font-bold"
                    style={{ color: colors.velvet }}
                  >
                    {client.orders ? client.orders.length : 0}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: colors.roseGold }}
                >
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: colors.light }}
                  >
                    {client.orders
                      ? client.orders.filter((o) => o.status === "ongoing")
                          .length
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

const OngoingOrderModal = ({ order, visible, onClose }) => {
  if (!order || !visible) return null;

  const getColorBadgeClass = (color) => {
    const map = {
      White: "bg-gray-100 text-gray-800 border-gray-200",
      Yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Pink: "bg-pink-50 text-pink-700 border-pink-200",
      Blue: "bg-blue-50 text-blue-700 border-blue-200",
      Green: "bg-green-50 text-green-700 border-green-200",
    };
    return map[color] || "bg-gray-50 text-gray-500 border-gray-200";
  };

  const columns = [
    { 
      title: "SR No", 
      dataIndex: "srNo", 
      key: "srNo",
      className: "font-medium text-gray-600 bg-gray-50"
    },
    { 
      title: "Style No", 
      dataIndex: "styleNo", 
      key: "styleNo",
      className: "font-medium text-gray-600 bg-gray-50" 
    },
    {
      title: "Diamond Clarity",
      dataIndex: "diamondClarity",
      key: "diamondClarity",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (text) => <span className="text-gray-700">{text || "-"}</span>,
    },
    {
      title: "Diamond Color",
      dataIndex: "diamondColor",
      key: "diamondColor",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (text) =>
        text ? (
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getColorBadgeClass(
              text
            )}`}
          >
            {text}
          </span>
        ) : (
          "-"
        ),
    },
    { 
      title: "Quantity", 
      dataIndex: "quantity", 
      key: "quantity",
      className: "font-medium text-gray-600 bg-gray-50",
    },
    {
      title: "Gross WT",
      dataIndex: "grossWeight",
      key: "grossWeight",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (val) => <span className="text-gray-700">{val?.toFixed(2) || "-"}</span>,
    },
    {
      title: "Net WT",
      dataIndex: "netWeight",
      key: "netWeight",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (val) => <span className="text-gray-700">{val?.toFixed(2) || "-"}</span>,
    },
    {
      title: "DIA WT",
      dataIndex: "diaWeight",
      key: "diaWeight",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (val) => <span className="text-gray-700">{val?.toFixed(2) || "-"}</span>,
    },
    { 
      title: "DIA PCS", 
      dataIndex: "pcs", 
      key: "pcs",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
     { 
      title: "GOLD PURITY", 
      dataIndex: "goldPurity", 
      key: "goldPurity",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
    { 
      title: "GOLD COLOR", 
      dataIndex: "goldColor", 
      key: "goldColor",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      className: "font-medium text-gray-600 bg-gray-50",
      render: (val) => <span className="text-gray-700">{val || "-"}</span>,
    },
  ];

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : "80%"}
      style={{ top: 20 }}
      className="rounded-2xl overflow-hidden border-0"
      closable={false}
    >
      {/* Custom header with decorative elements */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"></div>
        <div className="absolute top-2 right-2">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Client Details First */}
        {order.client ? (
          <div className="mt-8 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Client Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</p>
                    <p className="text-base font-medium text-gray-800 mt-1">{order.client.name}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unique ID</p>
                    <p className="text-base font-medium text-gray-800 mt-1">{order.client.uniqueId}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</p>
                    <p className="text-base font-medium text-gray-800 mt-1">{order.client.gstNo || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 mb-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-yellow-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Client information not available</span>
          </div>
        )}

        {/* Order Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Order Summary
            </h3>
          </div>
          <div className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0 flex items-start space-x-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Order #{order.orderId || "N/A"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {dayjs(order.orderDate).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
                
              </div>
              <div className={`px-4 py-2 rounded-full ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"} font-medium`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Unknown"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {order.orderItems?.length || 0}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {dayjs(order.orderDate).format("DD MMM YYYY")}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expected Completion</p>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {order.expectedCompletionDate ? dayjs(order.expectedCompletionDate).format("DD MMM YYYY") : "Not set"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Description</p>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {order.orderDescription || "No description"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-5 py-4 border-2 border-gray-400">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Order Items
              </h3>
              <span className="text-sm text-gray-500 mt-1 md:mt-0">
                Showing {order.orderItems?.length || 0} items
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table
              dataSource={order.orderItems}
              columns={columns}
              rowKey="srNo"
              pagination={false}
              size="middle"
              scroll={{ x: true }}
              className="rounded-none border-0"
              rowClassName="hover:bg-gray-50 transition-colors border-b border-gray-400 last:border-b-0"
            />
          </div>
        </div>
      </div>
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
          className="rounded-2xl shadow-sm border "
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b p-4 pb-2"
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
          className="rounded-2xl shadow-sm border "
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b p-4 pb-2"
            style={{ color: colors.velvet }}
          >
            Ongoing Orders
          </h2>
          <Table
            dataSource={clients.flatMap((client) => {
              const ongoingOrders = (client.orders || []).filter(
                (order) => order.status === "ongoing"
              );
              return ongoingOrders.map((order) => ({
                ...order,
                clientuniqueId: client.uniqueId,
                client,
              }));
            })}
            columns={[
              {
                title: "Unique ID",
                dataIndex: "clientuniqueId",
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
                title: "Status",
                key: "status",
                render: (_, record) => {
                  let statusColor = colors.darkGold;
                  let backgroundColor = "#e6f4ff";

                  if (record.status === "COMPLETED") {
                    statusColor = colors.green;
                    backgroundColor = "#f6ffed";
                  } else if (record.status === "CANCELLED") {
                    statusColor = colors.red;
                    backgroundColor = "#fff2f0";
                  } else if (record.status === "PENDING") {
                    statusColor = colors.orange;
                    backgroundColor = "#fff7e6";
                  }

                  return (
                    <Tag
                      style={{
                        backgroundColor,
                        color: statusColor,
                        borderColor: statusColor,
                      }}
                    >
                      {record.status || "ONGOING"}
                    </Tag>
                  );
                },
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
          className="rounded-2xl shadow-sm border "
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
            dataSource={clients.flatMap((client) => {
              const ongoingOrders = (client.orders || []).filter(
                (order) => order.status === "completed"
              );
              return ongoingOrders.map((order) => ({
                ...order,
                clientuniqueId: client.uniqueId,
                client,
              }));
            })}
            columns={[
              {
                title: "Unique ID",
                dataIndex: "clientuniqueId",
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
                title: "Status",
                key: "status",
                render: (_, record) => {
                  let statusColor = colors.darkGold;
                  let backgroundColor = "#e6f4ff";

                  if (record.status === "COMPLETED") {
                    statusColor = colors.green;
                    backgroundColor = "#f6ffed";
                  } else if (record.status === "CANCELLED") {
                    statusColor = colors.red;
                    backgroundColor = "#fff2f0";
                  } else if (record.status === "PENDING") {
                    statusColor = colors.orange;
                    backgroundColor = "#fff7e6";
                  }

                  return (
                    <Tag
                      style={{
                        backgroundColor,
                        color: statusColor,
                        borderColor: statusColor,
                      }}
                    >
                      {record.status || "COMPLETED"}
                    </Tag>
                  );
                },
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
      </div>

      {/* Client Modal */}
      <ClientModal client={modalClient} onClose={closeModal} />

      {/* Ongoing Order Modal */}
      <OngoingOrderModal
        order={selectedOrder}
        visible={ongoingOrderModalVisible}
        onClose={closeOrderModal}
      />
    </div>
  );
const renderKYCForm = () => (
  <Form
    form={kycForm}
    onFinish={handleKYCSubmit}
    layout="vertical"
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
  >
    {/* Header */}
    <div className="text-center mb-12">
      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Client <span className="text-[#050d3f]">KYC</span> Form
      </h1>
      <p className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto">
        Complete the form below to verify your client information
      </p>
    </div>

    {/* Form Container */}
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Form Sections */}
      <div className="divide-y divide-gray-200">
        {/* Personal Information Section */}
<div className="py-8 px-6 sm:p-10">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
    <span className="bg-blue-100 text-[#050d3f] p-2 rounded-full mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </span>
    Personal Information
  </h2>

  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
    <Form.Item
      name="name"
      label="Full Name"
      rules={[{ required: true, message: 'Please enter full name' }]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="John Doe"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="companyName"
      label="Company Name"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="Acme Inc."
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="phone"
      label="Mobile Number"
      rules={[
        { required: true, message: 'Please enter mobile number' },
        { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10 digit mobile number' }
      ]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        type="tel"
        placeholder="9876543210"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="mobile"
      label="Alternate Phone"
      rules={[
        { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10 digit mobile number' }
      ]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        type="tel"
        placeholder="9876543210"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="officePhone"
      label="Office Phone"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        type="tel"
        placeholder="022-1234567"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="landline"
      label="Landline"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        type="tel"
        placeholder="022-1234567"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    {/* Email Field - 1/3 width */}
    <Form.Item
      name="email"
      label="Email Address"
      rules={[
        { type: 'email', message: 'Please enter valid email' }
      ]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        type="email"
        placeholder="john@example.com"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    {/* Address Field - 2/3 width */}
    <Form.Item
      name="address"
      label="Complete Address"
      rules={[{ required: true, message: 'Please enter address' }]}
      className="sm:col-span-2 block text-sm font-medium text-gray-700 mb-1"
    >
      <Input.TextArea
        rows={3}
        placeholder="123 Main St, City, State, PIN Code"
        className="py-3 px-4 block w-full border-2 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>
  </div>
</div>


       {/* Business Information Section */}
<div className="py-8 px-6 sm:p-10 bg-white rounded-2xl border border-gray-200 shadow-sm">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
    <span className="bg-blue-100 text-[#050d3f] p-2 rounded-full mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </span>
    Business Information
  </h2>

  {/* Row 1: GST, Company PAN, Owner PAN */}
  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3 mb-6">
    <Form.Item
      name="gstNo"
      label="GST Number"
      rules={[{ validator: validateGST }]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="22AAAAA0000A1Z5"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
    </Form.Item>

    <Form.Item
      name="companyPAN"
      label="Company PAN"
      rules={[{ validator: validatePAN }]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        maxLength={10}
        placeholder="ABCDE1234F"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
    </Form.Item>

    <Form.Item
      name="ownerPAN"
      label="Owner PAN"
      rules={[{ validator: validatePAN }]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        maxLength={10}
        placeholder="ABCDE1234F"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
    </Form.Item>
  </div>

  {/* Row 2: Aadhar, MSME, IEC */}
  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
    <Form.Item
      name="aadharNumber"
      label="Aadhar Number"
      rules={[{ validator: validateAadhar }]}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        maxLength={12}
        placeholder="1234 5678 9012"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="msmeNumber"
      label="MSME Registration"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="UDYAM-XX-XX-XXXXXX"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"                                                                                   
      />
    </Form.Item>
  </div>

  {/* Row 3: IGI, HUID, Diamond Weight Lazer Marking */}
  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
    <Form.Item
      name="igi"
      label="IGI"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="IGI Certificate Number"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="huid"
      label="HUID"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="Hallmark Unique Identification"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="diamondWeightLazerMarking"
      label="Diamond Weight Lazer Marking"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="Diamond Weight Lazer Marking"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>

    <Form.Item
      name="importExportCode"
      label="Import/Export Code"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      <Input
        placeholder="IEC-XXXXXXXXXX"
        className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </Form.Item>
  </div>
</div>


   {/* Document Upload Section */}
<div className="py-8 px-6 sm:p-10 border border-gray-200 rounded-lg bg-white">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
    <span className="bg-blue-100 text-[#050d3f] p-2 rounded-full mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </span>
    Document Upload
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* GST Certificate */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        GST Certificate <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>

    {/* Company PAN */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Company PAN <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>

    {/* Aadhar Document */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Aadhar Document <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>

    {/* Import/Export Doc */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Import/Export Doc
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>

    {/* MSME Certificate */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        MSME Certificate
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>

    {/* Visiting Card */}
    <div className="border border-gray-300 rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Visiting Card
      </label>
      <div className="flex items-center">
        <label className="px-4 py-2 bg-[#2b3153] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Choose File
          <input type="file" className="sr-only" />
        </label>
        <span className="ml-2 text-sm text-gray-500">No file chosen</span>
      </div>
    </div>
  </div>

  <div className="mt-6 text-sm text-gray-500">
    <p><span className="text-red-500">*</span> indicates required documents</p>
    <p className="mt-1">All documents should be clear and legible. Blurry or incomplete documents will be rejected.</p>
  </div>
</div>

        {/* Submit Button */}
        <div className="py-6 px-6 sm:px-10 bg-gray-50 text-right">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#050d3f] hover:bg-[#050d3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Submit KYC
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  </Form>
);



  const diamondClarityOptions = [
    "vvs",
    "vvs-vs",
    "vs",
    "vs-si",
    "si",
    
  ];

  const diamondColorOptions = [
    "e-f",
    "f-g",
    "g-h",
    "h-i",
    "i-j",
    "I",
    
   
  ];


  
  const goldPuritOptions = [
    "9K",
    "10K",
    "14K",   
    "18K",
    "21K",
    "22K",
  ];

  const goldColorOptions = [
    "White",
    "Yellow",
    "Rose",
   
    
    
   
  ];


const renderOrderForm = () => (
  <div>
    <h3 className="text-2xl font-semibold" style={{ color: colors.velvet }}>
      Create New Order
    </h3>
    <div
      className="rounded-lg "
      style={{
        backgroundColor: colors.diamond,
        borderColor: colors.darkGold,
      }}
    >
   <div className="mb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label
        className="block font-medium mb-2"
        style={{ color: colors.velvet }}
      >
        Client*
      </label>
      <Select
        showSearch
        placeholder="Select client"
        optionFilterProp="children"
        onChange={handleClientSelect}
        value={selectedClientId}
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        className="w-full"
        style={{
          borderColor: colors.darkGold,
        }}
        suffixIcon={
          <ChevronDown
            className="h-4 w-4"
            style={{ color: colors.darkGold }}
          />
        }
      >
        {clients.map((client) => (
          <Option key={client.uniqueId} value={client.uniqueId}>
            {client.uniqueId}
          </Option>
        ))}
      </Select>
    </div>
    
    <div>
      <label
        className="block font-medium mb-2"
        style={{ color: colors.velvet }}
      >
        Expected Completion Date*
      </label>
      <DatePicker
        value={expectedCompletionDate}
        onChange={(date) => setExpectedCompletionDate(date)}
        placeholder="Select completion date"
        className="w-full"
        style={{
          borderColor: colors.darkGold,
        }}
        disabledDate={(current) => current && current < dayjs().startOf('day')}
        format="DD MMM YYYY"
      />
    </div>
  </div>
</div>


      {selectedClientId && (
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
                <span className="font-medium" style={{ color: colors.velvet }}>
                  Client:
                </span>
                <span style={{ color: colors.deepNavy }}>
                  {clients.find(c => c.uniqueId === selectedClientId)?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium" style={{ color: colors.velvet }}>
                  Phone:
                </span>
                <span style={{ color: colors.deepNavy }}>
                  {clients.find(c => c.uniqueId === selectedClientId)?.phone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium" style={{ color: colors.velvet }}>
                  GST:
                </span>
                <span style={{ color: colors.deepNavy }}>
                  {clients.find(c => c.uniqueId === selectedClientId)?.gstNo || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium" style={{ color: colors.velvet }}>
                  Address:
                </span>
                <span style={{ color: colors.deepNavy }}>
                  {clients.find(c => c.uniqueId === selectedClientId)?.address || 'N/A'}
                </span>
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
                    {clients.find(c => c.uniqueId === selectedClientId)?.name || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-1" style={{ color: colors.velvet }}>
                    Phone:
                  </td>
                  <td className="p-1" style={{ color: colors.deepNavy }}>
                    {clients.find(c => c.uniqueId === selectedClientId)?.phone || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-1" style={{ color: colors.velvet }}>
                    GST:
                  </td>
                  <td className="p-1" style={{ color: colors.deepNavy }}>
                    {clients.find(c => c.uniqueId === selectedClientId)?.gstNo || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-1" style={{ color: colors.velvet }}>
                    Address:
                  </td>
                  <td className="p-1" style={{ color: colors.deepNavy }}>
                    {clients.find(c => c.uniqueId === selectedClientId)?.address || 'N/A'}
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
              className="rounded-lg p-4 border"
              style={{ borderColor: colors.darkGold }}
            >
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium" style={{ color: colors.velvet }}>
                  Item {index + 1}
                </h5>
                <Button
                  size="small"
                  danger
                  icon={<Minus className="h-4 w-4" />}
                  onClick={() => removeOrderItem(index)}
                  style={{
                    backgroundColor: colors.roseGold,
                    borderColor: colors.roseGold,
                    color: 'white'
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    SR No
                  </label>
                  <InputNumber
                    value={item.srNo}
                    onChange={(val) => updateOrderItem(index, "srNo", val)}
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    Style No*
                  </label>
                  <Select
                    value={item.styleNo}
                    onChange={(value) => {
                      updateOrderItem(index, "styleNo", value);
                      // Auto-fill other fields when style number is selected
                      if (value) {
                        const selectedStyle = styleNumbers.find(style => style.styleNumber === value);
                        if (selectedStyle) {
                          updateOrderItem(index, "diamondClarity", selectedStyle.clarity || "");
                          updateOrderItem(index, "diamondColor", selectedStyle.color || "");
                          updateOrderItem(index, "grossWeight", selectedStyle.grossWt || 0);
                          updateOrderItem(index, "netWeight", selectedStyle.netWt || 0);
                          updateOrderItem(index, "diaWeight", selectedStyle.diaWt || 0);
                          updateOrderItem(index, "pcs", selectedStyle.diaPcs || 1);
                        }
                      }
                    }}
                    placeholder="Select style number"
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toLowerCase().includes(input.toLowerCase())
                    }
                    allowClear
                  >
                    {styleNumbers.map((style) => (
                      <Option key={style.styleNumber} value={style.styleNumber}>
                        {style.styleNumber} - {style.serialNumber}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    Diamond Clarity
                  </label>
                  <Select
                    value={item.diamondClarity}
                    onChange={(val) =>
                      updateOrderItem(index, "diamondClarity", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    placeholder="Select clarity"
                  >
                    {diamondClarityOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block font-medium" style={{ color: colors.velvet }}>
                    Diamond Color
                  </label>
                  <Select
                    value={item.diamondColor}
                    onChange={(val) =>
                      updateOrderItem(index, "diamondColor", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    placeholder="Select color"
                  >
                    {diamondColorOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block font-medium" style={{ color: colors.velvet }}>
                    Gold Purity
                  </label>
                  <Select
                    value={item.goldPurity}
                    onChange={(val) =>
                      updateOrderItem(index, "goldPurity", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    placeholder="Select purity"
                  >
                    {goldPuritOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block font-medium" style={{ color: colors.velvet }}>
                    Gold Color
                  </label>
                  <Select
                    value={item.goldColor}
                    onChange={(val) =>
                      updateOrderItem(index, "goldColor", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    placeholder="Select color"
                  >
                    {goldColorOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block font-medium" style={{ color: colors.velvet }}>
                    Gross WT
                  </label>
                  <InputNumber
                    value={item.grossWeight ?? 0.0}
                    onChange={(val) =>
                      updateOrderItem(index, "grossWeight", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    min={0}
                    step={0.01}
                    formatter={(value) => parseFloat(value || 0).toFixed(2)}
                    parser={(value) =>
                      parseFloat(value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium" style={{ color: colors.velvet }}>
                    Net WT
                  </label>
                  <InputNumber
                    value={item.netWeight ?? 0.0}
                    onChange={(val) =>
                      updateOrderItem(index, "netWeight", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    min={0}
                    step={0.01}
                    formatter={(value) => parseFloat(value || 0).toFixed(2)}
                    parser={(value) =>
                      parseFloat(value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    DIA WT
                  </label>
                  <InputNumber
                    value={item.diaWeight ?? 0.0}
                    onChange={(val) =>
                      updateOrderItem(index, "diaWeight", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    min={0}
                    step={0.01}
                    formatter={(value) => parseFloat(value || 0).toFixed(2)}
                    parser={(value) =>
                      parseFloat(value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    DIA PCS*
                  </label>
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    Quantity
                  </label>
                  <InputNumber
                    value={item.quantity}
                    onChange={(val) =>
                      updateOrderItem(index, "quantity", val)
                    }
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.velvet }}>
                    Remark
                  </label>
                  <Input.TextArea
                    value={item.remark}
                    onChange={(e) =>
                      updateOrderItem(index, "remark", e.target.value)
                    }
                    rows={2}
                    style={{ width: "100%", borderColor: colors.darkGold }}
                    placeholder={`Remark for item ${index + 1}`}
                  />
                </div>
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Modern Form Layout */}
          <div className="space-y-6 mb-8">
            {orderItems.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                  </div>
                  <Button
                    size="middle"
                    danger
                    onClick={() => removeOrderItem(index)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-2"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>}
                  >
                    Remove Item
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* SR No */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      SR No
                    </label>
                    <InputNumber
                      value={item.srNo}
                      onChange={(val) => updateOrderItem(index, "srNo", val)}
                      className="w-full h-11 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      min={1}
                      placeholder="1"
                    />
                  </div>

                  {/* Style No */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Style No <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={item.styleNo}
                      onChange={(value) => {
                        updateOrderItem(index, "styleNo", value);
                        // Auto-fill other fields when style number is selected
                        if (value) {
                          const selectedStyle = styleNumbers.find(style => style.styleNumber === value);
                          if (selectedStyle) {
                            console.log("Selected style:", selectedStyle); // Debug log
                            updateOrderItem(index, "diamondClarity", selectedStyle.clarity || "");
                            updateOrderItem(index, "diamondColor", selectedStyle.color || "");
                            updateOrderItem(index, "grossWeight", selectedStyle.grossWt || 0);
                            updateOrderItem(index, "netWeight", selectedStyle.netWt || 0);
                            updateOrderItem(index, "diaWeight", selectedStyle.diaWt || 0);
                            updateOrderItem(index, "pcs", selectedStyle.diaPcs || 1);
                            // Store the selected image
                            setSelectedStyleImages(prev => {
                              const newImages = {
                                ...prev,
                                [index]: selectedStyle.imageFile || ""
                              };
                              console.log("Updated selectedStyleImages:", newImages); // Debug log
                              return newImages;
                            });
                          }
                        } else {
                          // Clear image when style is deselected
                          setSelectedStyleImages(prev => ({
                            ...prev,
                            [index]: ""
                          }));
                        }
                      }}
                      placeholder="Select style number"
                      className="w-full h-11"
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {styleNumbers.map((style) => (
                        <Option key={style.styleNumber} value={style.styleNumber}>
                          {style.styleNumber} - {style.serialNumber}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Style Image Display */}
                  {item.styleNo && (
                    <div className="col-span-full sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Product Image
                        </label>
                        <div className="flex justify-center">
                          {selectedStyleImages[index] ? (
                            <img 
                              src={selectedStyleImages[index]} 
                              alt={`Style ${item.styleNo}`}
                              className="max-w-full h-48 object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {!selectedStyleImages[index] && (
                            <div className="flex flex-col items-center justify-center h-48 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-500 text-sm">No image available for this style</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Diamond Clarity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Diamond Clarity
                    </label>
                    <Select
                      value={item.diamondClarity}
                      onChange={(val) => updateOrderItem(index, "diamondClarity", val)}
                      placeholder="Select clarity"
                      className="w-full h-11"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {diamondClarityOptions.map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Diamond Color */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Diamond Color
                    </label>
                    <Select
                      value={item.diamondColor}
                      onChange={(val) => updateOrderItem(index, "diamondColor", val)}
                      placeholder="Select color"
                      className="w-full h-11"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {diamondColorOptions.map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Gold Purity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Gold Purity
                    </label>
                    <Select
                      value={item.goldPurity}
                      onChange={(val) => updateOrderItem(index, "goldPurity", val)}
                      placeholder="Select purity"
                      className="w-full h-11"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {goldPuritOptions.map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Gold Color */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      Gold Color
                    </label>
                    <Select
                      value={item.goldColor}
                      onChange={(val) => updateOrderItem(index, "goldColor", val)}
                      placeholder="Select color"
                      className="w-full"
                    >
                      {goldColorOptions.map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Gross Weight */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      Gross WT
                    </label>
                    <InputNumber
                      value={item.grossWeight ?? 0.0}
                      onChange={(val) => updateOrderItem(index, "grossWeight", val)}
                      className="w-full"
                      min={0}
                      step={0.01}
                      formatter={(value) => parseFloat(value || 0).toFixed(2)}
                      parser={(value) => parseFloat(value.replace(/[^\d.]/g, ""))}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Net Weight */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      Net WT
                    </label>
                    <InputNumber
                      value={item.netWeight ?? 0.0}
                      onChange={(val) => updateOrderItem(index, "netWeight", val)}
                      className="w-full"
                      min={0}
                      step={0.01}
                      formatter={(value) => parseFloat(value || 0).toFixed(2)}
                      parser={(value) => parseFloat(value.replace(/[^\d.]/g, ""))}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Diamond Weight */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      DIA WT
                    </label>
                    <InputNumber
                      value={item.diaWeight ?? 0.0}
                      onChange={(val) => updateOrderItem(index, "diaWeight", val)}
                      className="w-full"
                      min={0}
                      step={0.01}
                      formatter={(value) => parseFloat(value || 0).toFixed(2)}
                      parser={(value) => parseFloat(value.replace(/[^\d.]/g, ""))}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Diamond PCS */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      DIA PCS *
                    </label>
                    <InputNumber
                      value={item.pcs}
                      onChange={(val) => updateOrderItem(index, "pcs", val)}
                      className="w-full"
                      min={1}
                      placeholder="1"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      Quantity *
                    </label>
                    <InputNumber
                      value={item.quantity}
                      onChange={(val) => updateOrderItem(index, "quantity", val)}
                      className="w-full"
                      min={1}
                      placeholder="1"
                    />
                  </div>

                  {/* Remark */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.velvet }}>
                      Remark
                    </label>
                    <Input.TextArea
                      value={item.remark}
                      onChange={(e) => updateOrderItem(index, "remark", e.target.value)}
                      rows={2}
                      className="w-full"
                      placeholder={`Add remarks for item ${index + 1}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
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
          
          {orderItems.length > 1 && (
            <Button
              danger
              onClick={() => removeOrderItem(orderItems.length - 1)}
              icon={<Minus className="h-4 w-4" />}
              style={{
                backgroundColor: colors.platinum,
                color: colors.roseGold,
                borderColor: colors.roseGold,
              }}
            >
              Remove Last Item
            </Button>
          )}
        </div>

        {/* Order-level Amount and Description (appears only once) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border" style={{ borderColor: colors.darkGold }}>
          <h4 className="text-lg font-medium mb-4" style={{ color: colors.velvet }}>
            Order Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.velvet }}>
                Total Amount
              </label>
              <InputNumber
                value={orderAmount}
                onChange={(val) => setOrderAmount(val)}
                style={{
                  width: "100%",
                  borderColor: colors.darkGold,
                }}
                min={0}
                step={0.01}
                placeholder="Enter total order amount (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.velvet }}>
                Order Description
              </label>
              <Input.TextArea
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", borderColor: colors.darkGold }}
                placeholder="Enter order description"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
  <Button
    type="primary"
    onClick={handleOrderSubmit}
    loading={loading}
    style={{
      backgroundColor: colors.darkGold,
      color: colors.light,
      border: "none",
      fontWeight: "500", // correct value
      padding: "8px 24px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          showSearch
          placeholder="Search by Client ID or Name"
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          onSearch={(value) => setSearchTerm(value)}
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase()) ||
            (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: '100%' }}
          allowClear
          notFoundContent={null}
        >
          {clients.map(client => (
            <Option 
              key={client.uniqueId} 
              value={client.uniqueId}
            >
              <div className="flex justify-between">
                <span>{client.uniqueId}</span>
                <span className="text-gray-500 ml-2">{client.name}</span>
              </div>
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '100%' }}
          allowClear
        >
          <Option value="all">All Statuses</Option>
          <Option value="ongoing">Ongoing</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>

        <RangePicker
          style={{ width: '100%' }}
          onChange={(dates) => setDateRange(dates)}
          placeholder={['Start Date', 'End Date']}
        />
      </div>

      {/* Orders Table */}
      <div className="grid grid-cols-1 gap-6">
        {/* All Orders */}
        <div
          className="rounded-2xl shadow-sm border"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.darkGold,
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 border-b p-4 pb-2"
            style={{ color: colors.velvet }}
          >
            All Orders
          </h2>
          
          {isMobile ? (
            <div className="space-y-4 p-4">
              {getFilteredOrders().length > 0 ? (
                getFilteredOrders().map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4"
                    style={{ borderColor: colors.darkGold }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Order ID:</span>
                        <span style={{ color: colors.darkGold }}>{order.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Client ID:</span>
                        <span>{order.client?.uniqueId || 'N/A'}</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="font-medium">Client Name:</span>
                        <span>{order.client?.name || 'N/A'}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="font-medium">Order Date:</span>
                        <span>{dayjs(order.orderDate).format('DD MMM YYYY')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Expected Completion:</span>
                        <span>{order.expectedCompletionDate ? dayjs(order.expectedCompletionDate).format('DD MMM YYYY') : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Tag
                          style={{
                            backgroundColor:
                              order.status === 'completed' ? '#e6f7ee' : '#e6f4ff',
                            color:
                              order.status === 'completed' ? '#08965b' : colors.darkGold,
                          }}
                        >
                          {order.status?.toUpperCase() || 'UNKNOWN'}
                        </Tag>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Items:</span>
                        <span>{order.orderItems?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Amount:</span>
                        <span>₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Order Description:</span>
                        <span className="text-right max-w-xs truncate" title={order.orderDescription}>
                          {order.orderDescription || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p>No orders found matching your criteria</p>
                </div>
              )}
            </div>
          ) : (
            <Table
              dataSource={getFilteredOrders()}
              columns={[
                {
                  title: 'Order ID',
                  dataIndex: 'orderId',
                  key: 'orderId',
                  render: (text) => (
                    <span className="font-medium" style={{ color: colors.darkGold }}>
                      {text}
                    </span>
                  ),
                },
                {
                  title: 'Client ID',
                  dataIndex: ['client', 'uniqueId'],
                  key: 'clientId',
                  render: (text) => (
                    <span className="text-gray-600">{text || 'N/A'}</span>
                  ),
                },
                /* {
                  title: 'Client Name',
                  dataIndex: ['client', 'name'],
                  key: 'clientName',
                  render: (text) => (
                    <span className="text-gray-600">{text || 'N/A'}</span>
                  ),
                }, */
                {
                  title: 'Order Date',
                  dataIndex: 'orderDate',
                  key: 'date',
                  render: (date) => dayjs(date).format('DD MMM YYYY'),
                },
                {
                  title: 'Expected Completion',
                  dataIndex: 'expectedCompletionDate',
                  key: 'expectedCompletion',
                  render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-',
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, record) => {
                    let statusColor = colors.darkGold;
                    let backgroundColor = '#e6f4ff';

                    if (record.status === 'completed') {
                      statusColor = '#08965b';
                      backgroundColor = '#e6f7ee';
                    } else if (record.status === 'cancelled') {
                      statusColor = '#cf1322';
                      backgroundColor = '#fff2f0';
                    }

                    return (
                      <Tag
                        style={{
                          backgroundColor,
                          color: statusColor,
                          borderColor: statusColor,
                        }}
                      >
                        {record.status?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Items',
                  dataIndex: 'orderItems',
                  key: 'items',
                  render: (items) => items?.length || 0,
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  render: (amount) => (
                    <span className="font-medium text-green-600">
                      ₹{amount?.toFixed(2) || '0.00'}
                    </span>
                  ),
                },
                {
                  title: 'Order Description',
                  dataIndex: 'orderDescription',
                  key: 'orderDescription',
                  render: (desc) => (
                    <span className="text-gray-600 max-w-xs truncate" title={desc}>
                      {desc || '-'}
                    </span>
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
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
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
              size="small"
              bordered
              className="custom-table"
              onRow={(record) => ({
                onClick: () => handleOrderClick(record),
                style: { cursor: 'pointer', backgroundColor: colors.light },
              })}
            />
          )}
        </div>
      </div>
    </div>

    <OngoingOrderModal
      order={selectedOrder}
      visible={ongoingOrderModalVisible}
      onClose={closeOrderModal}
    />
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
              style={{ color: colors.velvet }}
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
        order={selectedOrder}
        visible={ongoingOrderModalVisible}
        onClose={closeOrderModal}
      />

      {/* Custom Table Styling */}
      {/* <style jsx global>{`
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
      `}</style> */}
    </div>
  );
};

export default SalesDashboard;

