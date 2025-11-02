# PHP to HTML Conversion - FinderAI Authentication System

## ✅ Conversion Complete

All PHP authentication files have been successfully converted to HTML and integrated with the Node.js backend.

## 📁 New File Structure

```
FinderAI/
├── public/
│   ├── index.html              ← Homepage (updated with login link)
│   ├── login.html              ← Login page (converted from login.php)
│   ├── register.html           ← Registration page (converted from register.php)
│   ├── dashboard.html          ← User dashboard (converted from dashboard.php)
│   ├── lostitem.html          ← Report found items
│   ├── claimitem.html         ← Report lost items
│   │
│   ├── styles/
│   │   ├── auth.css           ← Authentication pages styling (from php/css/style.css)
│   │   ├── styles.css         ← Homepage styles
│   │   ├── lostitem.css       ← Lost item form styles
│   │   └── claimitem.css      ← Claim item form styles
│   │
│   ├── scripts/
│   │   └── auth.js            ← Authentication JavaScript (from php/js/script.js)
│   │
│   └── assets/
│       ├── mapua.jpg          ← Background image (copied from php/assets/)
│       └── mmcm_logo.png      ← MMCM logo (copied from php/assets/)
│
├── routes/
│   └── auth.js                ← Updated authentication routes (REST API)
│
├── models/
│   └── User.js                ← Updated user model with new schema
│
└── php/                       ← Original PHP files (can be archived/deleted)
```

## 🔄 Key Changes

### 1. **User Model** (`models/User.js`)
Updated schema to match PHP database structure:
```javascript
{
  studentId: String (required, unique)
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (default: 'student')
  createdAt: Date
}
```

### 2. **Authentication Routes** (`routes/auth.js`)
New endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/verify` - Token verification for protected routes

### 3. **Frontend Pages**

#### **login.html**
- Pure HTML (no PHP session logic)
- Uses Fetch API to POST to `/api/auth/login`
- Stores JWT token in localStorage
- Password visibility toggle
- Error/success popups

#### **register.html**
- Pure HTML form
- Client-side password matching validation
- Posts to `/api/auth/register` endpoint
- Redirects to login on success

#### **dashboard.html**
- Protected page - checks for valid token on load
- Fetches user data from `/api/auth/verify`
- Displays user profile information
- Links to report found/lost items
- Logout functionality (clears localStorage)

## 🔐 Authentication Flow

### Registration:
1. User fills form on `register.html`
2. Form submits to `/api/auth/register` (POST)
3. Backend hashes password with bcrypt
4. User saved to MongoDB
5. Redirect to `login.html?registered=success`

### Login:
1. User enters credentials on `login.html`
2. Form submits to `/api/auth/login` (POST)
3. Backend validates credentials
4. JWT token generated and returned
5. Token stored in localStorage
6. Redirect to `dashboard.html`

### Protected Routes:
1. Page checks for token in localStorage
2. Sends token to `/api/auth/verify` (GET)
3. Backend validates token with JWT
4. User data returned if valid
5. If invalid, redirect to `login.html`

## 🎨 Styling

All styles from `php/css/style.css` have been copied to `public/styles/auth.css` with proper organization:
- Glassmorphism effects
- Background blur with overlay
- Responsive design
- Beautiful form containers
- Popup notifications
- Password toggle icons

## 📝 Key Features Preserved

✅ **From PHP Version:**
- Student ID, First Name, Last Name, Email fields
- Password hashing (bcrypt instead of SHA256)
- Email uniqueness validation
- Session management (now JWT-based)
- Beautiful UI with Mapúa background
- MMCM logo in corner
- Password visibility toggle
- Registration success popup
- Error handling

✅ **New Enhancements:**
- RESTful API architecture
- JWT token authentication (more secure than PHP sessions)
- MongoDB instead of MySQL
- Single Page Application approach
- Better password hashing (bcrypt vs SHA256)
- Token expiration (24 hours)
- Protected route verification

## 🚀 Testing the System

### 1. Start the Server:
```bash
node server.js
```

### 2. Navigate to:
- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login.html
- **Register**: http://localhost:3000/register.html

### 3. Test Flow:
1. Click "LOGIN" in navigation or go to register page
2. Create an account with Student ID, Name, Email, Password
3. After successful registration, login
4. View dashboard with profile info
5. Access "Report Found Item" or "Report Lost Item"
6. Logout returns to login page

## 🗄️ Database

The system uses MongoDB with the following collections:
- **users** - Authentication data (studentId, firstName, lastName, email, password hash)
- **items** - Lost/found items with AI embeddings

## 🔧 Environment Variables

Ensure your `.env` file has:
```
JWT_SECRET=your_secret_key_here
MONGO_URI=mongodb+srv://...
PORT=3000
```

## 📦 Dependencies

All required packages are already installed:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

## ✨ What's Different from PHP?

| Feature | PHP Version | HTML/Node.js Version |
|---------|-------------|---------------------|
| Backend | PHP with MySQL | Node.js with MongoDB |
| Sessions | PHP Sessions | JWT Tokens |
| Password Hash | SHA256 | Bcrypt (more secure) |
| Database | MySQL tables | MongoDB collections |
| Frontend | PHP embedded in HTML | Pure HTML + JavaScript |
| API | Form POST to PHP files | REST API endpoints |
| Authentication | Session cookies | Bearer tokens |

## 🎯 Next Steps

1. ✅ All authentication pages converted
2. ✅ Backend routes updated
3. ✅ User model updated
4. ✅ Assets copied
5. ✅ Styling preserved
6. ✅ Navigation updated

**Ready for use!** The authentication system is fully functional and integrated with your existing FinderAI lost & found features.

---

## 🗑️ PHP Folder

The original `php/` folder can now be:
- Archived for reference
- Deleted (all functionality migrated)
- Kept as backup

All its functionality has been successfully migrated to the HTML/Node.js/MongoDB stack.
