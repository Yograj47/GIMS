export const joinUserRooms = (
    socket
) => {
    if (socket.user.role !== "customer" && socket.user.isVerified) socket.join("workspace");
    if (socket.user.customerId && socket.user.isVerified) socket.join(`customer:${socket.user.customerId}`);
    socket.join(
        `user:${socket.user.id}`
    );

    socket.join(
        `role:${socket.user.role}`
    );
};
