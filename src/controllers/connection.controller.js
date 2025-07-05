// src/controllers/connection.controller.js
import {User} from '../models/user.model.js';

export const addConnection = async (req, res) => {
  try {
    const { _id: currentUserId } = req.user; // ✅ From token
    const { userId } = req.body;

    if (!userId || userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Invalid connection user.' });
    }

    const userToConnect = await User.findById(userId);
    if (!userToConnect) {
      return res.status(404).json({ message: 'User to connect not found.' });
    }

    // ✅ Fetch actual user from DB
    const currentUserDoc = await User.findById(currentUserId);

    if (!currentUserDoc.connections.includes(userId)) {
      currentUserDoc.connections.push(userId);
      await currentUserDoc.save();
    }

    res.status(200).json({ message: 'Connection added successfully.' });
  } catch (err) {
    console.error('Failed to add connection:', err);
    res.status(500).json({ message: 'Failed to add connection.' });
  }
};
// controllers/connection.controller.js
import Connection from '../models/connection.model.js';
export const removeConnectionController = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const result = await Connection.deleteOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.status(200).json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Failed to remove connection' });
  }
};

export const getConnections = async (req, res) => {
  try {
    const currentUser = req.user;

    const populatedUser = await User.findById(currentUser._id).populate(
      'connections',
      '-password'
    );

    res.status(200).json({ connections: populatedUser.connections || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get connections.' });
  }
};
