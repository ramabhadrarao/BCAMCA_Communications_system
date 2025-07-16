import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getPendingUsers: () => api.get('/auth/pending-users'),
  approveUser: (userId: string) => api.put(`/auth/approve-user/${userId}`),
  getAllUsers: () => api.get('/auth/users'),
};

// Groups API
export const groupsAPI = {
  createGroup: (groupData: any) => api.post('/groups', groupData),
  getGroups: () => api.get('/groups'),
  getGroup: (groupId: string) => api.get(`/groups/${groupId}`),
  addMember: (groupId: string, userId: string) => api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId: string, userId: string) => api.delete(`/groups/${groupId}/members/${userId}`),
  getAvailableStudents: (groupId: string) => api.get(`/groups/${groupId}/available-students`),
};

// Messages API
export const messagesAPI = {
  sendMessage: (formData: FormData) => api.post('/messages', formData),
  getMessages: (groupId: string, page?: number) => api.get(`/messages/${groupId}?page=${page || 1}`),
  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
};

// Assignments API
export const assignmentsAPI = {
  createAssignment: (formData: FormData) => api.post('/assignments', formData),
  getAssignments: (groupId: string) => api.get(`/assignments/group/${groupId}`),
  getAssignment: (assignmentId: string) => api.get(`/assignments/${assignmentId}`),
  submitAssignment: (assignmentId: string, formData: FormData) => api.post(`/assignments/${assignmentId}/submit`, formData),
  gradeAssignment: (assignmentId: string, submissionId: string, data: any) => api.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
  getGradeSheet: (assignmentId: string) => api.get(`/assignments/${assignmentId}/grade-sheet`),
};

// Polls API
export const pollsAPI = {
  createPoll: (pollData: any) => api.post('/polls', pollData),
  votePoll: (pollId: string, optionIndex: number) => api.post(`/polls/${pollId}/vote`, { optionIndex }),
  getPoll: (pollId: string) => api.get(`/polls/${pollId}`),
  getPolls: (groupId: string) => api.get(`/polls/group/${groupId}`),
};