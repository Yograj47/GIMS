export const joinUserRooms = (
    socket
) => {
    socket.join(
        `user:${socket.user.id}`
    );

    socket.join(
        `role:${socket.user.role}`
    );
};