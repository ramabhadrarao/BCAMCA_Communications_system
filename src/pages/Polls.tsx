import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Users, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pollsAPI, groupsAPI } from '../services/api';
import { Poll, Group } from '../types';
import { format } from 'date-fns';

const Polls: React.FC = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    groupId: '',
    multipleChoice: false,
    expiresAt: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupsResponse = await groupsAPI.getGroups();
      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      const allPolls: Poll[] = [];
      for (const group of groupsData) {
        try {
          const pollsResponse = await pollsAPI.getPolls(group._id);
          allPolls.push(...pollsResponse.data);
        } catch (error) {
          console.error(`Error fetching polls for group ${group._id}:`, error);
        }
      }

      allPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPolls(allPolls);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const pollData = {
      ...newPoll,
      options: newPoll.options.filter(opt => opt.trim() !== ''),
    };

    try {
      await pollsAPI.createPoll(pollData);
      setShowCreateModal(false);
      setNewPoll({
        question: '',
        options: ['', ''],
        groupId: '',
        multipleChoice: false,
        expiresAt: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await pollsAPI.votePoll(pollId, optionIndex);
      fetchData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, ''],
    });
  };

  const removeOption = (index: number) => {
    setNewPoll({
      ...newPoll,
      options: newPoll.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: updatedOptions,
    });
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.options.some(option =>
      option.votes.some(vote => vote.user._id === user?._id)
    );
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (poll: Poll, optionIndex: number) => {
    const totalVotes = getTotalVotes(poll);
    if (totalVotes === 0) return 0;
    return (poll.options[optionIndex].votes.length / totalVotes) * 100;
  };

  const isPollExpired = (poll: Poll) => {
    return poll.expiresAt && new Date(poll.expiresAt) < new Date();
  };

  const canCreatePolls = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';
  const canVote = user?.role === 'student';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading polls...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
        {canCreatePolls && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {polls.map((poll) => {
          const totalVotes = getTotalVotes(poll);
          const userVoted = hasUserVoted(poll);
          const expired = isPollExpired(poll);

          return (
            <div key={poll._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{poll.question}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Created by {poll.createdBy.name}</span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{totalVotes} votes</span>
                    </span>
                    {poll.expiresAt && (
                      <span className={`flex items-center space-x-1 ${expired ? 'text-red-600' : 'text-yellow-600'}`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {expired ? 'Expired' : `Expires ${format(new Date(poll.expiresAt), 'MMM dd, yyyy HH:mm')}`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {poll.multipleChoice && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Multiple Choice
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {poll.options.map((option, index) => {
                  const votes = option.votes.length;
                  const percentage = getVotePercentage(poll, index);
                  const userVotedForThis = option.votes.some(vote => vote.user._id === user?._id);

                  return (
                    <div key={index} className="relative">
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        userVotedForThis ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3 flex-1">
                          {canVote && !userVoted && !expired && (
                            <button
                              onClick={() => handleVote(poll._id, index)}
                              className="w-4 h-4 border-2 border-gray-400 rounded-full hover:border-blue-500 flex-shrink-0"
                            />
                          )}
                          {userVotedForThis && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{option.text}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{votes} votes</span>
                          <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      {totalVotes > 0 && (
                        <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg transition-all duration-300"
                             style={{ width: `${percentage}%` }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {canCreatePolls && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Vote Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {poll.options.map((option, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">{option.text}</p>
                        <div className="space-y-1">
                          {option.votes.map((vote, voteIndex) => (
                            <div key={voteIndex} className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">
                                  {vote.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600">{vote.user.name}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(vote.votedAt), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          ))}
                          {option.votes.length === 0 && (
                            <span className="text-xs text-gray-500">No votes yet</span>
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

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Poll</h2>
            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your poll question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  required
                  value={newPoll.groupId}
                  onChange={(e) => setNewPoll({ ...newPoll, groupId: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Add Option
                </button>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newPoll.multipleChoice}
                    onChange={(e) => setNewPoll({ ...newPoll, multipleChoice: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Allow multiple choices</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newPoll.expiresAt}
                  onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Polls;