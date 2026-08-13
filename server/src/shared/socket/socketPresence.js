const onlineUsers = new Map();

/**
 * Map Structure
 *
 * userId => Set(socketIds)
 */

export const addConnection = (
    userId,
    socketId
) => {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(
            userId,
            new Set()
        );
    }

    onlineUsers
        .get(userId)
        .add(socketId);
};

export const removeConnection = (
    userId,
    socketId
) => {
    const sockets =
        onlineUsers.get(userId);

    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
        onlineUsers.delete(userId);
    }
};

export const isOnline = (
    userId
) => {
    return onlineUsers.has(userId);
};

export const getUserSockets = (
    userId
) => {
    return onlineUsers.get(userId) || new Set();
};

export const getOnlineUsers =
    () => {
        return [
            ...onlineUsers.keys(),
        ];
    };

export const getOnlineCount =
    () => {
        return onlineUsers.size;
    };

export const getPresenceState =
    () => {
        return onlineUsers;
    };