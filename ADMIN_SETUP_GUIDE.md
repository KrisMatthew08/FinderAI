# Admin Panel Setup Guide

## ✅ Admin Features Implemented

### **Admin Dashboard** (`admin.html`)
A complete admin interface with:
- 📊 **Statistics Dashboard** - Total, Found, Lost, Claimed items count
- 📋 **Items Table** - View all items with images
- 🔍 **Filtering** - Filter by All, Found, Lost, or Claimed status
- ✏️ **Edit Items** - Update category, location, description, type
- ✅ **Mark as Claimed** - Set items as reunited with owner
- 🗑️ **Delete Items** - Remove items permanently
- 🔒 **Access Control** - Only users with role='admin' can access

### **Backend Routes Added**
- `GET /api/items/all` - Retrieve all items (including claimed)
- `PUT /api/items/update/:id` - Update item details
- `PUT /api/items/claim/:id` - Mark item as claimed
- `DELETE /api/items/delete/:id` - Delete item

### **Dashboard Integration**
- Admin users see an "Admin Panel" button on their dashboard
- Regular users don't see this button
- Button styled in red to indicate admin privileges

---

## 🔧 How to Create an Admin User

### **Method 1: Via MongoDB Compass (Easiest)**

1. **Open MongoDB Compass** and connect to your database
2. Navigate to: `FinderAI` → `users` collection
3. Find the user you want to make admin
4. Click **Edit Document** (pencil icon)
5. Change the `role` field from `"student"` to `"admin"`
6. Click **Update**

### **Method 2: Via MongoDB Shell**

```javascript
// Connect to your MongoDB
use FinderAI

// Find your user by email
db.users.findOne({ email: "your.email@mcm.edu.ph" })

// Update role to admin
db.users.updateOne(
  { email: "your.email@mcm.edu.ph" },
  { $set: { role: "admin" } }
)

// Verify the change
db.users.findOne({ email: "your.email@mcm.edu.ph" })
```

### **Method 3: Via Node.js Script**

Create a file `make-admin.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAdmin(email) {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOneAndUpdate(
    { email: email },
    { role: 'admin' },
    { new: true }
  );
  
  if (user) {
    console.log('✅ User is now admin:', user.email, user.role);
  } else {
    console.log('❌ User not found');
  }
  
  await mongoose.disconnect();
}

// Replace with your email
makeAdmin('your.email@mcm.edu.ph');
```

Run it:
```bash
node make-admin.js
```

---

## 📖 How to Access Admin Panel

### **Step 1: Register/Login as Admin**
1. Go to `http://localhost:3000/register.html`
2. Create an account (or use existing account)
3. Set the account's role to 'admin' using one of the methods above

### **Step 2: Login**
1. Go to `http://localhost:3000/login.html`
2. Login with admin credentials
3. You'll be redirected to the dashboard

### **Step 3: Access Admin Panel**
1. On the dashboard, you'll see an **"Admin Panel"** button (red)
2. Click it to access `http://localhost:3000/admin.html`
3. You'll see:
   - Statistics cards (Total, Found, Lost, Claimed)
   - Full items table with all data
   - Edit, Claim, and Delete buttons for each item

---

## 🎯 Admin Panel Features

### **1. View All Items**
- See complete list of all items (found and lost)
- View images, categories, locations, descriptions
- See item status (Active or Claimed)
- View creation dates

### **2. Filter Items**
Click the filter buttons at the top:
- **All** - Show all items
- **Found** - Show only found items
- **Lost** - Show only lost items
- **Claimed** - Show only claimed/reunited items

### **3. Edit Item**
1. Click the **Edit** button (blue pencil icon)
2. Modal opens with current item details
3. Update:
   - Category
   - Location
   - Description
   - Type (Found/Lost)
4. Click **Update Item**

### **4. Mark as Claimed**
1. Click the **Claim** button (green checkmark)
2. Confirm the action
3. Item status changes to "CLAIMED"
4. Item is marked as reunited with owner

### **5. Delete Item**
1. Click the **Delete** button (red trash icon)
2. Confirm deletion (permanent action)
3. Item is removed from database

---

## 🔒 Security Features

### **Access Control**
- ✅ Only users with `role: 'admin'` can access admin.html
- ✅ Non-admin users are redirected to homepage
- ✅ Unauthenticated users are redirected to login
- ✅ Token verification on page load

### **Authorization Checks**
```javascript
// Admin check on page load
if (data.user.role !== 'admin') {
  alert('Access Denied: Admin only!');
  window.location.href = 'index.html';
  return;
}
```

---

## 📊 Statistics Dashboard

The admin panel shows real-time statistics:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Items  │ Found Items  │ Lost Items   │ Claimed Items│
│     24       │      15      │      9       │      6       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Auto-updates when items are edited, claimed, or deleted.

---

## 🎨 Admin Panel UI

### **Color Scheme**
- **Primary**: `#733015` (Brown header)
- **Secondary**: `#800505` (Red logout button)
- **Success**: `#28a745` (Green claim button)
- **Info**: `#007bff` (Blue edit button)
- **Danger**: `#dc3545` (Red delete button)

### **Badges**
- **FOUND**: Green badge
- **LOST**: Red badge
- **CLAIMED**: Yellow badge
- **ACTIVE**: Default (no badge)

---

## 🚀 Testing the Admin Panel

### **Test Workflow:**

1. **Create Admin User**
   ```bash
   # Register at /register.html
   # Then update role in MongoDB
   ```

2. **Login as Admin**
   ```bash
   # Go to /login.html
   # Login with admin credentials
   ```

3. **Test Features**
   - View dashboard → See "Admin Panel" button
   - Click "Admin Panel" → Access admin interface
   - View statistics → Should show correct counts
   - Filter items → Test All, Found, Lost, Claimed
   - Edit item → Update details and save
   - Claim item → Mark as reunited
   - Delete item → Remove permanently

---

## 💡 Quick Setup Commands

```bash
# 1. Ensure server is running
node server.js

# 2. Register a new user
# Go to: http://localhost:3000/register.html

# 3. Make user admin via MongoDB Compass
# Or via shell:
mongosh
use FinderAI
db.users.updateOne(
  { email: "admin@mcm.edu.ph" },
  { $set: { role: "admin" } }
)

# 4. Login and access admin panel
# Go to: http://localhost:3000/login.html
# Then: http://localhost:3000/admin.html
```

---

## 🎯 Summary

**Admin Panel URL**: `http://localhost:3000/admin.html`

**Default Roles**:
- `student` - Regular user (default)
- `staff` - Staff member
- `admin` - Full admin access

**Admin Capabilities**:
- ✅ View all items (including claimed)
- ✅ Edit item details
- ✅ Mark items as claimed
- ✅ Delete items permanently
- ✅ Filter and search items
- ✅ View statistics dashboard

**Access Control**:
- 🔒 Role-based authentication
- 🔒 Token verification
- 🔒 Automatic redirects for unauthorized access

---

Your admin panel is now fully functional! 🎉
