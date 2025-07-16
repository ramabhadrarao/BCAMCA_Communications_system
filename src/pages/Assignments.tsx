import React, { useState, useEffect } from 'react';
import { Plus, Clock, FileText, Download, Upload, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentsAPI, groupsAPI } from '../services/api';
import { Assignment, Group } from '../types';
import { format } from 'date-fns';

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    groupId: '',
    deadline: '',
    maxMarks: 100,
  });

  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupsResponse = await groupsAPI.getGroups();
      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      const allAssignments: Assignment[] = [];
      for (const group of groupsData) {
        try {
          const assignmentsResponse = await assignmentsAPI.getAssignments(group._id);
          allAssignments.push(...assignmentsResponse.data);
        } catch (error) {
          console.error(`Error fetching assignments for group ${group._id}:`, error);
        }
      }

      allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('groupId', newAssignment.groupId);
    formData.append('deadline', newAssignment.deadline);
    formData.append('maxMarks', newAssignment.maxMarks.toString());

    try {
      await assignmentsAPI.createAssignment(formData);
      setShowCreateModal(false);
      setNewAssignment({
        title: '',
        description: '',
        groupId: '',
        deadline: '',
        maxMarks: 100,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await assignmentsAPI.submitAssignment(selectedAssignment._id, formData);
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSelectedFiles([]);
      fetchData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const handleGradeSubmission = async (assignmentId: string, submissionId: string) => {
    try {
      await assignmentsAPI.gradeAssignment(assignmentId, submissionId, gradeData);
      setGradeData({ grade: 0, feedback: '' });
      fetchData();
    } catch (error) {
      console.error('Error grading assignment:', error);
    }
  };

  const downloadGradeSheet = async (assignmentId: string) => {
    try {
      const response = await assignmentsAPI.getGradeSheet(assignmentId);
      const gradeSheet = response.data;
      
      // Create CSV content
      const csvContent = [
        ['Name', 'Registration Number', 'Submitted At', 'Grade', 'Feedback', 'Graded'].join(','),
        ...gradeSheet.submissions.map((sub: any) => [
          sub.studentName,
          sub.regdno,
          sub.submittedAt ? format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm') : 'Not submitted',
          sub.grade || 0,
          sub.feedback || '',
          sub.graded ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gradeSheet.assignmentTitle}_grades.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading grade sheet:', error);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-yellow-600' };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
    return { text: `Due in ${days} days`, color: 'text-green-600' };
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (user?.role === 'student') {
      const submission = assignment.submissions.find(sub => sub.student._id === user._id);
      if (submission) {
        return {
          text: submission.graded ? `Graded: ${submission.grade}/${assignment.maxMarks}` : 'Submitted',
          color: submission.graded ? 'text-green-600' : 'text-blue-600'
        };
      }
      return { text: 'Not submitted', color: 'text-gray-600' };
    }
    return { text: `${assignment.submissions.length} submissions`, color: 'text-blue-600' };
  };

  const canCreateAssignments = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        {canCreateAssignments && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const deadlineStatus = formatDeadline(assignment.deadline);
          const submissionStatus = getSubmissionStatus(assignment);
          const isStudent = user?.role === 'student';
          const hasSubmitted = isStudent && assignment.submissions.some(sub => sub.student._id === user?._id);

          return (
            <div key={assignment._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Created by {assignment.createdBy.name}</span>
                    <span>Max Marks: {assignment.maxMarks}</span>
                    <span className={deadlineStatus.color}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {deadlineStatus.text}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isStudent && !hasSubmitted && new Date(assignment.deadline) > new Date() && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitModal(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit</span>
                    </button>
                  )}
                  {canCreateAssignments && (
                    <button
                      onClick={() => downloadGradeSheet(assignment._id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Grade Sheet</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${submissionStatus.color}`}>
                    {submissionStatus.text}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Due: {format(new Date(assignment.deadline), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {/* Submissions for Faculty */}
              {canCreateAssignments && assignment.submissions.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Submissions</h4>
                  <div className="space-y-2">
                    {assignment.submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {submission.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {submission.student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {submission.student.regdno} • Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.graded ? (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-green-600">
                                {submission.grade}/{assignment.maxMarks}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                max={assignment.maxMarks}
                                min="0"
                                placeholder="Grade"
                                value={gradeData.grade}
                                onChange={(e) => setGradeData({ ...gradeData, grade: parseInt(e.target.value) })}
                                className="w-16 px-2 py-1 text-sm border rounded"
                              />
                              <input
                                type="text"
                                placeholder="Feedback"
                                value={gradeData.feedback}
                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                className="w-32 px-2 py-1 text-sm border rounded"
                              />
                              <button
                                onClick={() => handleGradeSubmission(assignment._id, submission._id)}
                                className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Grade
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  required
                  value={newAssignment.groupId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} - {group.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected files: {selectedFiles.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;