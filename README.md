# BCA Communication Platform

A comprehensive WhatsApp-like communication platform designed for educational institutions, specifically for BCA programs. This platform enables seamless communication between students, faculty, and administrators.

## Features

### User Management
- **Role-based Access Control**: Students, Faculty, HOD, and Admin roles
- **User Registration**: Separate registration flows for students and faculty
- **Admin Approval**: All users require admin approval before accessing the platform
- **Profile Management**: Users can update their profiles and photos

### Group Communication
- **WhatsApp-like Interface**: Modern, intuitive chat interface
- **Faculty-only Group Creation**: Only faculty can create groups and manage members
- **Real-time Messaging**: Live chat with Socket.io integration
- **File Sharing**: Support for documents, images, audio, and video files
- **YouTube Integration**: Share YouTube videos directly in chat

### Assignment Management
- **Assignment Creation**: Faculty can create assignments with deadlines
- **File Submissions**: Students can upload multiple files for assignments
- **Unique File Naming**: Files are automatically named with student info, purpose, and timestamp
- **Grading System**: Faculty can grade assignments and provide feedback
- **Grade Sheets**: Download comprehensive grade sheets in CSV format
- **Deadline Tracking**: Visual indicators for assignment deadlines

### Poll System
- **Interactive Polls**: Faculty can create polls for student feedback
- **Multiple Choice Options**: Support for single and multiple choice polls
- **Real-time Results**: Live poll results with percentage breakdowns
- **Student-only Voting**: Only students can participate in polls
- **Poll Expiration**: Optional expiration dates for polls

### Admin Features
- **User Approval**: Approve/reject new user registrations
- **User Management**: View and manage all users in the system
- **Faculty Registration**: Admin/HOD can register new faculty members
- **System Statistics**: Dashboard with user and activity statistics

## Technical Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **Lucide React** for icons

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
MONGODB_URI=mongodb://localhost:27017/bca-communication
JWT_SECRET=your-jwt-secret-key
PORT=3001
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/pending-users` - Get pending approvals (Admin only)
- `PUT /api/auth/approve-user/:userId` - Approve user (Admin only)

### Groups
- `POST /api/groups` - Create group (Faculty only)
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `POST /api/groups/:groupId/members` - Add member (Faculty only)
- `DELETE /api/groups/:groupId/members/:userId` - Remove member (Faculty only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:groupId` - Get group messages
- `PUT /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete message

### Assignments
- `POST /api/assignments` - Create assignment (Faculty only)
- `GET /api/assignments/group/:groupId` - Get group assignments
- `GET /api/assignments/:assignmentId` - Get assignment details
- `POST /api/assignments/:assignmentId/submit` - Submit assignment (Students only)
- `PUT /api/assignments/:assignmentId/submissions/:submissionId/grade` - Grade assignment (Faculty only)
- `GET /api/assignments/:assignmentId/grade-sheet` - Download grade sheet (Faculty only)

### Polls
- `POST /api/polls` - Create poll (Faculty only)
- `POST /api/polls/:pollId/vote` - Vote on poll (Students only)
- `GET /api/polls/:pollId` - Get poll details
- `GET /api/polls/group/:groupId` - Get group polls

## File Upload System

The platform includes a sophisticated file upload system with unique naming conventions:

### File Naming Convention
Files are automatically renamed using the following format:
```
{userId}_{role}_{purpose}_{date}_{time}_{originalExtension}
```

Example:
```
64f8b9c12345678901234567_student_assignment_2024-01-15_14-30-25.pdf
```

### Supported File Types
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: JPG, JPEG, PNG, GIF, SVG
- Audio: MP3, WAV, OGG
- Video: MP4, AVI, MOV, WMV
- Archives: ZIP, RAR, 7Z

### File Size Limits
- Maximum file size: 50MB per file
- Multiple files can be uploaded for assignments

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcryptjs
- Protected routes and API endpoints

### File Security
- File type validation
- Size restrictions
- Secure file storage
- Unique file naming to prevent conflicts

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Usage Guide

### For Students
1. Register with your details including registration number
2. Wait for admin approval
3. Join groups assigned by faculty
4. Participate in group discussions
5. Submit assignments before deadlines
6. Vote on polls created by faculty
7. View your grades and feedback

### For Faculty
1. Register with your subject and batch details
2. Wait for admin approval
3. Create groups for your subjects
4. Add students to your groups
5. Share study materials and announcements
6. Create assignments with deadlines
7. Grade student submissions
8. Create polls for student feedback
9. Download grade sheets

### For Admin/HOD
1. Approve/reject user registrations
2. Monitor system usage and statistics
3. Register new faculty members
4. Manage user accounts
5. Access all system features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.