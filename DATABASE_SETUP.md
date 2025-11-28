# Database Setup Instructions

## ✅ What Has Been Implemented

### Backend:
1. **Order Model** (`backend/models/Order.js`) - Stores all orders with status, materials, rejection reasons
2. **Inventory Model** (`backend/models/Inventory.js`) - Stores metal inventory (Gold, Diamond, Silver, Platinum, Other)
3. **Order Controller** (`backend/controllers/OrderController.js`) - Handles all order operations
4. **Inventory Controller** (`backend/controllers/InventoryController.js`) - Handles inventory operations
5. **Routes** - Added `/api/orders` and `/api/inventory` routes
6. **Frontend Updated** - AccountsDashboard and ProductionTeam now use database instead of localStorage

### Frontend:
1. **AccountsDashboard** - Now fetches inventory and orders from DB, saves edits to DB
2. **ProductionTeam** - Now fetches accepted/rejected orders from DB

## 🔧 Manual Setup Required

### 1. Initial Inventory Setup
When you first run the application, the inventory will be automatically created with default values:
- Gold: 1500.50 grams
- Diamond: 250.75 carats
- Silver: 5000.00 grams
- Platinum: 800.25 grams
- Other: 100.00 pieces

**No action needed** - This happens automatically when you access the inventory for the first time.

### 2. Initial Orders Setup (Optional)
If you want to seed some initial orders for testing, you can:

**Option A: Use the frontend**
- Go to Accounts Dashboard → All Orders tab
- The orders will be created through the Sales team or manually via API

**Option B: Create via API**
```bash
POST http://localhost:3001/api/orders/create
Content-Type: application/json

{
  "orderId": "ORD001",
  "orderDate": "2024-01-15",
  "clientName": "Rajesh Kumar",
  "description": "Custom Necklace Set",
  "gold": { "quantity": 50, "unit": "grams" },
  "diamond": { "quantity": 5, "unit": "carats" },
  "silver": { "quantity": 100, "unit": "grams" },
  "platinum": { "quantity": 20, "unit": "grams" },
  "status": "pending"
}
```

### 3. Environment Variables
Make sure your `.env` file has:
```
MONGO_URI=your_mongodb_connection_string
PORT=3001
SESSION_SECRET=your_secret_key
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.com
```

## 📝 API Endpoints

### Inventory:
- `GET /api/inventory` - Get current inventory
- `PUT /api/inventory/update` - Update entire inventory
- `PUT /api/inventory/update/:metal` - Update specific metal (gold, diamond, silver, platinum, other)

### Orders:
- `GET /api/orders/all` - Get all orders
- `GET /api/orders/status/:status` - Get orders by status (pending, accepted, rejected)
- `GET /api/orders/accepted` - Get accepted orders
- `GET /api/orders/rejected` - Get rejected orders
- `POST /api/orders/create` - Create new order
- `PUT /api/orders/accept/:orderId` - Accept an order
- `PUT /api/orders/reject/:orderId` - Reject an order
- `PUT /api/orders/update/:orderId` - Update an order
- `DELETE /api/orders/delete/:orderId` - Delete an order

## 🚀 Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Inventory:**
   - Login to Accounts Dashboard
   - Go to Inventory tab
   - Edit any metal quantity
   - Check MongoDB to verify it's saved

4. **Test Orders:**
   - Go to All Orders tab
   - Accept or Reject an order
   - Check Production Dashboard to see accepted/rejected orders
   - Verify in MongoDB that orders are saved

## ⚠️ Important Notes

1. **Inventory is stored in DB** - All edits are saved to database
2. **Orders are stored in DB** - All order operations use database
3. **No localStorage for orders/inventory** - Everything is in MongoDB now
4. **Auto-rejection** - If materials are insufficient, order is automatically rejected
5. **Real-time updates** - Production dashboard checks for new orders every 2 seconds

## 🔍 Database Collections

- **orders** - All orders (pending, accepted, rejected)
- **inventory** - Single document with all metal quantities

## 📞 Need Help?

If you encounter any issues:
1. Check MongoDB connection
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Verify environment variables are set correctly

