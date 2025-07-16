import Poll from '../models/Poll.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';

export const createPoll = async (req, res) => {
  try {
    const { question, options, groupId, multipleChoice, expiresAt } = req.body;
    
    const poll = new Poll({
      question,
      options: options.map(opt => ({ text: opt, votes: [] })),
      group: groupId,
      createdBy: req.user.userId,
      multipleChoice,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await poll.save();

    // Add poll to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { polls: poll._id }
    });

    // Create a message for the poll
    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content: `Poll: ${question}`,
      type: 'poll',
      poll: poll._id
    });

    await message.save();

    // Add message to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id }
    });

    const populatedPoll = await Poll.findById(poll._id)
      .populate('createdBy', 'name email role')
      .populate('options.votes.user', 'name email regdno');

    res.status(201).json(populatedPoll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user.userId)
    );

    if (hasVoted && !poll.multipleChoice) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Add vote
    if (optionIndex >= 0 && optionIndex < poll.options.length) {
      poll.options[optionIndex].votes.push({
        user: req.user.userId,
        votedAt: new Date()
      });
    }

    await poll.save();

    const updatedPoll = await Poll.findById(pollId)
      .populate('createdBy', 'name email role')
      .populate('options.votes.user', 'name email regdno');

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await Poll.findById(pollId)
      .populate('createdBy', 'name email role')
      .populate('options.votes.user', 'name email regdno');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPolls = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const polls = await Poll.find({ group: groupId })
      .populate('createdBy', 'name email role')
      .populate('options.votes.user', 'name email regdno')
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};