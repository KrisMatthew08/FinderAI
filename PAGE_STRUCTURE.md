# FinderAI - Page Navigation Flow

## 📄 Complete Page Structure

### **Public Pages** (No authentication required)
```
┌─────────────────────────────────────┐
│         index.html (Homepage)       │
│  - Intro section                    │
│  - Navigation tabs                  │
│  - "FIND NOW" button                │
│  - Link to LOGIN                    │
└───────────┬─────────────────────────┘
            │
            ├─── Click "LOGIN" ────────►┌─────────────────────────┐
            │                            │    login.html           │
            │                            │  - Email & Password     │
            │                            │  - Link to Register     │
            │                            └──────────┬──────────────┘
            │                                       │
            │                            ┌──────────▼──────────────┐
            │                            │   register.html         │
            │                            │  - Student ID           │
            │                            │  - Name, Email, Pass    │
            │                            │  - Link to Login        │
            │                            └──────────┬──────────────┘
            │                                       │
            │                            ┌──────────▼──────────────┐
            │                            │  Backend: /api/auth/    │
            │                            │   register → login      │
            │                            └──────────┬──────────────┘
            │                                       │
            └────────── After Login ───────────────┘
                                                    │
                            ┌───────────────────────▼──────────────────────┐
                            │         dashboard.html (Protected)           │
                            │  - User profile info                         │
                            │  - "Report Found Item" button               │
                            │  - "Report Lost Item" button                │
                            │  - Logout button                            │
                            └──────────┬──────────────┬────────────────────┘
                                       │              │
                ┌──────────────────────┘              └────────────────────┐
                │                                                          │
    ┌───────────▼────────────┐                           ┌────────────────▼────────────┐
    │   lostitem.html        │                           │    claimitem.html           │
    │  (Report FOUND items)  │                           │  (Report LOST items)        │
    │  - Upload image        │                           │  - Upload image             │
    │  - Category dropdown   │                           │  - Category dropdown        │
    │  - Location            │                           │  - School email             │
    │  - Description         │                           │  - Student ID               │
    └───────────┬────────────┘                           └────────────┬────────────────┘
                │                                                     │
                └─────────────────┬───────────────────────────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │  Backend: POST     │
                        │ /api/items/upload  │
                        │  - AI Processing   │
                        │  - Save to MongoDB │
                        └────────────────────┘
```

## 🔐 Authentication Pages

### **1. login.html**
- **Path**: `/login.html`
- **Purpose**: User login
- **Fields**:
  - Email
  - Password (with eye toggle)
- **Actions**:
  - POST to `/api/auth/login`
  - Receives JWT token
  - Stores in localStorage
  - Redirects to `dashboard.html`
- **Links**: 
  - Register link → `register.html`

### **2. register.html**
- **Path**: `/register.html`
- **Purpose**: New user registration
- **Fields**:
  - Student ID
  - First Name
  - Last Name
  - Email
  - Password (with eye toggle)
  - Confirm Password (with eye toggle)
- **Validation**:
  - Password matching check
  - Email format validation
- **Actions**:
  - POST to `/api/auth/register`
  - Redirects to `login.html?registered=success`
- **Links**: 
  - Login link → `login.html`

### **3. dashboard.html**
- **Path**: `/dashboard.html`
- **Purpose**: User home page after login
- **Protection**: Requires valid JWT token
- **Features**:
  - Welcome message with user's first name
  - Profile info display (Name, Email, Student ID)
  - Action buttons
- **Actions**:
  - "Report Found Item" → `lostitem.html`
  - "Report Lost Item" → `claimitem.html`
  - "Logout" → Clears localStorage → `login.html`
- **On Load**: 
  - Checks localStorage for token
  - Verifies token with `/api/auth/verify`
  - Redirects to login if invalid

## 📋 Item Management Pages

### **4. lostitem.html**
- **Path**: `/lostitem.html`
- **Purpose**: Report items that were FOUND
- **Access**: Can be accessed from dashboard or directly
- **Fields**:
  - Image upload (with preview)
  - Category dropdown
  - Location found
  - Description
  - Finder's name
- **Actions**:
  - FormData POST to `/api/items/upload`
  - Type set to `'found'`
  - Python AI processes image
  - Shows success popup
  - Redirects to `index.html`

### **5. claimitem.html**
- **Path**: `/claimitem.html`
- **Purpose**: Report items that were LOST
- **Access**: Can be accessed from dashboard or directly
- **Fields**:
  - Image upload (with preview)
  - Category dropdown
  - School email
  - Student ID
  - Description
- **Actions**:
  - FormData POST to `/api/items/upload`
  - Type set to `'lost'`
  - Python AI processes image
  - Shows success popup
  - Redirects to `index.html`

## 🎨 Styling Organization

```
styles/
├── auth.css          ← Login, Register, Dashboard pages
│   - Glassmorphism design
│   - Background with Mapúa image
│   - Form containers
│   - Password toggle icons
│   - Popup notifications
│
├── styles.css        ← Homepage (index.html)
│   - Navigation bar
│   - Intro section
│   - Tabs styling
│
├── lostitem.css      ← Report found items page
│   - Form styling
│   - File upload
│   - Popup animations
│
└── claimitem.css     ← Report lost items page
    - Form styling
    - Input fields
    - Button styles
```

## 🔄 User Journey Examples

### **New User Registration & Reporting**
```
1. Visit http://localhost:3000
2. Click "LOGIN" in nav
3. Click "Register" link
4. Fill registration form
5. Submit → Redirect to login
6. Login with credentials
7. View dashboard with profile
8. Click "Report Found Item"
9. Upload image and details
10. Submit → AI processes → Saved
```

### **Returning User**
```
1. Visit http://localhost:3000/login.html
2. Enter email and password
3. Login → Dashboard
4. Click "Report Lost Item"
5. Upload image and details
6. Submit → AI processes → Saved
```

### **Direct Item Reporting** (No login required)
```
1. Visit http://localhost:3000
2. Click "Report Found Item" tab
3. Fill form with image
4. Submit → Saved to database
```

## 📱 Navigation Bar Structure

### **Homepage** (index.html)
```
┌─────────────────────────────────────────────────┐
│ HOME  │  ABOUT  │  LOGIN  │  CONTACT  │  HELP  │
└─────────────────────────────────────────────────┘
```

### **Form Pages** (lostitem.html, claimitem.html)
```
┌─────────────────────────────────────────────────┐
│ HOME  │  ABOUT  │  LOGOUT  │  CONTACT  │  HELP │
└─────────────────────────────────────────────────┘
```
Note: These link back to `index.html`

### **Auth Pages** (login.html, register.html, dashboard.html)
```
No navigation bar - uses logo in corner
Logo links to https://mcm.edu.ph/
```

## 🎯 File Organization Summary

**Total Pages**: 6 HTML files
- `index.html` - Landing page
- `login.html` - Authentication
- `register.html` - User creation
- `dashboard.html` - User home
- `lostitem.html` - Found items form
- `claimitem.html` - Lost items form

**CSS Files**: 4 stylesheets
- `auth.css` - Authentication pages
- `styles.css` - Homepage
- `lostitem.css` - Found items form
- `claimitem.css` - Lost items form

**JavaScript Files**: 1 script
- `auth.js` - Password toggle, popups

**Assets**: 2 images
- `mapua.jpg` - Background image
- `mmcm_logo.png` - School logo

---

Everything is now properly organized and connected! 🎉
