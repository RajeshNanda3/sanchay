# Admin Dashboard Application

A professional, scalable admin dashboard for managing vendor purchase transactions. Built with React, Vite, and Tailwind CSS.

## Features

- **Admin Authentication**: Secure login with OTP verification
- **Purchase Request Management**: View all pending, approved, and rejected purchase requests
- **Transaction Approval/Rejection**: Approve or reject vendor purchase requests with real-time updates
- **Statistics Dashboard**: Quick overview of transaction statistics
- **Responsive Design**: Fully responsive interface for desktop and mobile devices
- **Real-time Status Updates**: Immediate feedback on transaction status changes
- **Role-Based Access Control**: Only admins can access the admin panel

## Tech Stack

- **Frontend**: React 19, Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Toastify
- **Routing**: React Router DOM v7

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── NavBar.jsx           # Navigation component
│   │   └── PurchaseTransaction.jsx # Transaction card component
│   ├── pages/
│   │   ├── Login.jsx            # Admin login page
│   │   ├── VerifyOtp.jsx        # OTP verification page
│   │   ├── Dashboard.jsx        # Main dashboard with transactions
│   │   └── Transactions.jsx     # Transactions view
│   ├── context/
│   │   └── AppContext.jsx       # Global state management
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Application entry point
│   ├── apiInterceptor.js        # Axios configuration with interceptors
│   ├── Loading.jsx              # Loading component
│   └── index.css                # Tailwind CSS imports
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Backend API running on `http://localhost:8000`

### Setup Steps

1. **Install Dependencies**

   ```bash
   cd admin
   npm install
   ```

2. **Environment Configuration**
   The API server URL is configured in `src/main.jsx`:

   ```javascript
   export const server = "http://localhost:8000";
   ```

   Update this if your backend is running on a different URL.

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5174`

## Usage

### Login Flow

1. Navigate to the admin dashboard
2. Enter your admin email and password
3. Receive OTP at your registered email
4. Enter OTP to complete authentication
5. Access the dashboard

### Managing Transactions

1. Dashboard shows statistics and pending requests
2. Filter transactions by status (Pending, Approved, Rejected, All)
3. Click "Approve" to approve a purchase request
4. Click "Reject" to reject a purchase request (with confirmation)
5. Statistics update in real-time

### Navigation

- **Dashboard**: View all transactions and statistics
- **Transactions**: Detailed transaction management
- **Logout**: Securely log out from the admin panel

## API Integration

The admin app connects to the following backend endpoints:

### Authentication

- `POST /api/v1/users/login` - Admin login
- `POST /api/v1/users/verify-otp` - OTP verification
- `GET /api/v1/users/me` - Get current user info
- `POST /api/v1/users/logout` - Logout
- `POST /api/v1/users/refresh` - Refresh token
- `POST /api/v1/users/refresh-csrf` - Refresh CSRF token

### Transactions

- `GET /api/v1/admin/pending-requests` - Get all pending transactions
- `POST /api/v1/admin/approve-purchase-request` - Approve a transaction
- `POST /api/v1/admin/reject-purchase-request` - Reject a transaction

## API Interceptor Features

The axios interceptor handles:

- Request CSRF token injection
- Automatic token refresh on 403 responses
- CSRF token refresh when needed
- Request queue management during token refresh
- Proper error handling and retry logic

## Error Handling

The application provides user-friendly error messages through:

- Toast notifications for feedback
- HTTP error response handling
- Graceful fallbacks for failed requests
- Automatic retry logic for transient failures

## Build & Deployment

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Scalability Considerations

### Current Architecture Supports:

- Adding new admin pages by creating files in `pages/`
- Creating reusable components in `components/`
- Extending context state for additional features
- Multiple transaction status types
- Batch operations on transactions

### Future Enhancement Ideas:

- Transaction history and audit logs
- Admin user management
- Advanced filtering and search
- Export transaction reports (CSV/PDF)
- Transaction statistics charts
- Admin activity logs
- Bulk approval/rejection operations
- Transaction comments/notes
- Email notifications for admins
- Role-based admin sub-roles (e.g., approver, reviewer)

## Security Features

- HTTP-only cookies for token storage
- CSRF token protection on mutations
- Role-based access control (ADMIN role only)
- Token refresh mechanism
- Secure logout with token revocation
- Protected routes requiring authentication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new features:

1. Maintain component modularity
2. Use Tailwind CSS for styling consistency
3. Add appropriate error handling
4. Include loading states
5. Use toast notifications for user feedback
6. Follow the existing code structure

## License

This project is part of the main application stack.

## Support

For issues or questions, refer to the main project documentation or contact the development team.
