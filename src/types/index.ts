export interface User {
  _id: string;
  regdno?: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  photo?: string;
  subject?: string;
  batch?: string;
  semester?: string;
  currentSemester?: string;
  currentBatch?: string;
  approved: boolean;
  groups?: string[];
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  batch: string;
  semester: string;
  createdBy: User;
  members: {
    user: User;
    joinedAt: string;
  }[];
  messages: string[];
  assignments: string[];
  polls: string[];
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  group: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'audio' | 'video' | 'youtube' | 'poll' | 'assignment';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  youtubeUrl?: string;
  poll?: Poll;
  assignment?: Assignment;
  readBy: {
    user: string;
    readAt: string;
  }[];
  createdAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  group: string;
  createdBy: User;
  deadline: string;
  maxMarks: number;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  submissions: {
    _id: string;
    student: User;
    submittedAt: string;
    files: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }[];
    grade: number;
    feedback: string;
    graded: boolean;
    gradedAt?: string;
    gradedBy?: User;
  }[];
  createdAt: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: {
    text: string;
    votes: {
      user: User;
      votedAt: string;
    }[];
  }[];
  group: string;
  createdBy: User;
  multipleChoice: boolean;
  expiresAt?: string;
  createdAt: string;
}