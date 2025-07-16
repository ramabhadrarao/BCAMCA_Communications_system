import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, BookOpen, BarChart3, Clock, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI, assignmentsAPI, pollsAPI } from '../services/api';
import { Group, Assignment, Poll } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [recentPolls, setRecentPolls] = useState<Poll[]>([]);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalAssignments: 0,
    totalPolls: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsResponse] = await Promise.all([
        groupsAPI.getGroups(),
      ]);

      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      // Fetch assignments and polls for each group
      const allAssignments: Assignment[] = [];
      const allPolls: Poll[] = [];

      for (const group of groupsData) {
        try {
          const [assignmentsResponse, pollsResponse] = await Promise.all([
            assignmentsAPI.getAssignments(group._id),
            pollsAPI.getPolls(group._id),
          ]);

          allAssignments.push(...assignmentsResponse.data);
          allPolls.push(...pollsResponse.data);
        } catch (error) {
          console.error(`Error fetching data for group ${group._id}:`, error);
        }
      }

      // Sort by creation date and take recent ones
      allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      allPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRecentAssignments(allAssignments.slice(0, 5));
      setRecentPolls(allPolls.slice(0, 5));

      // Calculate stats
      const pendingSubmissions = allAssignments.filter(assignment => {
        if (user?.role === 'student') {
          return !assignment.submissions.some(sub => sub.student._id === user._id);
        }
        return 0;
      }).length;

      setStats({
        totalGroups: groupsData.length,
        totalAssignments: allAssignments.length,
        totalPolls: allPolls.length,
        pendingSubmissions,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.name}!
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Polls</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPolls}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {user?.role === 'student' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Groups */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Groups</h2>
              <Link to="/groups" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {groups.slice(0, 5).map((group) => (
                <Link
                  key={group._id}
                  to={`/chat/${group._id}`}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.subject} • {group.members.length} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
              <Link to="/assignments" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDeadline(assignment.deadline)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {assignment.submissions.length} submissions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Polls */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Polls</h2>
            <Link to="/polls" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPolls.map((poll) => (
              <div key={poll._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {poll.question}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Created by {poll.createdBy.name}
                </p>
                <div className="space-y-2">
                  {poll.options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{option.text}</span>
                      <span className="text-xs text-gray-500">
                        {option.votes.length} votes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;