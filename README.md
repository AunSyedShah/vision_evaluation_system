# Project Evaluation System

A comprehensive ReactJS web application for managing project evaluations with three distinct user roles: Super Admin, Admin, and Evaluator.

## 🚀 Features

### Authentication
- **Login** for all roles (Super Admin, Admin, Evaluator)
- **Register** page (Evaluator only)
- Role-based access control using Context API
- localStorage-based authentication (ready for backend API integration)

### Super Admin Module
- **Full CRUD Operations** for projects
- **Upload Projects** via manual form entry or CSV/Excel upload
- **Download Sample CSV** template for bulk uploads
- **Assign Evaluators** (up to 2 per project)
- **View Evaluation Results** from all evaluators
- **All Results Data Table** - comprehensive view of all evaluations with filters and sorting
- **Manage Evaluators** - view all registered evaluators
- Complete dashboard with system statistics

### Admin Module
- **Upload Projects** (same functionality as Super Admin)
- **View-Only Access** to projects and details
- Cannot edit or delete projects
- Dashboard with project overview

### Evaluator Module
- **View Assigned Projects** only
- **Submit Evaluations** with score, comments, strengths, and areas for improvement
- **Edit Submitted Evaluations**
- Dashboard showing assignment statistics

## 🛠️ Tech Stack

- **React 19** - Latest React version
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Navigation and routing
- **Context API** - Global state management
- **Formik** - Form handling (without Yup)
- **Tailwind CSS 4** - Styling
- **localStorage** - Data persistence (simulating backend)
- **Bun** - JavaScript runtime

## 📦 Installation

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build
```

## 👥 Demo Credentials

### Super Admin
- **Email:** superadmin@system.com
- **Password:** SuperAdmin@123

### Admin
- **Email:** admin@system.com
- **Password:** Admin@123

### Evaluator
- Register a new account at `/register`

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── MainLayout.jsx   # Main layout with sidebar and topbar
│   ├── Sidebar.jsx      # Role-based navigation sidebar
│   ├── Topbar.jsx       # User info and logout
│   └── ProtectedRoute.jsx # Route protection
├── context/             # Context API
│   └── AuthContext.jsx  # Authentication context
├── pages/               # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Unauthorized.jsx
│   ├── SuperAdmin/      # Super Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── ProjectList.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── ProjectDetail.jsx
│   │   └── EvaluatorsList.jsx
│   ├── Admin/           # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── ProjectList.jsx
│   │   └── ProjectDetail.jsx
│   └── Evaluator/       # Evaluator pages
│       ├── Dashboard.jsx
│       ├── ProjectList.jsx
│       └── ProjectDetail.jsx
├── utils/               # Utility functions
│   └── localStorage.js  # localStorage operations
├── App.jsx              # Main app with routes
└── main.jsx             # Entry point
```

## 🔑 Key Features Explained

### localStorage Data Structure
All data is stored in localStorage with the following keys:
- `project_eval_users` - User accounts
- `project_eval_projects` - Project data
- `project_eval_evaluations` - Evaluation submissions
- `project_eval_current_user` - Current session

### CSV Upload Format
Download the sample CSV from the "Add Project" page. Required columns:
- title
- description
- startDate (YYYY-MM-DD)
- endDate (YYYY-MM-DD)
- budget
- client
- technology

### Role-Based Routing
- `/superadmin/*` - Super Admin routes
- `/admin/*` - Admin routes
- `/evaluator/*` - Evaluator routes
- Protected routes redirect unauthorized users

## 🎨 UI/UX Features

- **Fully Responsive Design** - Mobile-first approach, works perfectly on all devices
- **Purple/Magenta Theme** - Beautiful color scheme (#ab509d) with diagonal backgrounds
- **Tailwind CSS 4** - Modern, utility-first styling
- **Mobile Menu** - Slide-in sidebar navigation with backdrop
- **Touch-Optimized** - 44px minimum touch targets for mobile
- **Tab-Based Navigation** - Project details with scrollable tabs
- **Status Badges** - Visual indicators for evaluation status
- **Interactive Forms** - Real-time validation with Formik
- **Statistics Dashboard** - Overview cards for each role
- **Responsive Tables** - Horizontal scroll on mobile, full view on desktop

### 📱 Responsive Breakpoints
- **Mobile:** < 640px (1 column, overlay sidebar)
- **Tablet:** 640px - 1023px (2 columns, overlay sidebar)
- **Desktop:** ≥ 1024px (3 columns, fixed sidebar)

See `RESPONSIVE_DESIGN.md` for complete documentation.

## 🔄 Future Enhancements (Backend Integration)

The application is designed to easily integrate with a backend API:

1. Replace localStorage functions in `utils/localStorage.js` with API calls
2. Add token-based authentication
3. Implement file upload to server for CSV/Excel
4. Add real-time notifications
5. Implement pagination for large datasets
6. Add advanced filtering and search

## 📝 Development Notes

- All forms use Formik without Yup (custom validation)
- Context API manages authentication state
- localStorage is initialized with seed data on first load
- Super Admin and Admin credentials are hardcoded
- Evaluators can register freely

## 🐛 Known Limitations

- CSV parsing is basic (no validation)
- No file size limits on CSV uploads
- LocalStorage has size limitations (~5-10MB)
- No image upload for projects
- Evaluation score is simple number input (no rubric)

## 📄 License

This project is for educational purposes.
