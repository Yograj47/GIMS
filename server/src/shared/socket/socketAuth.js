export const socketAuth = async (
    socket,
    next
) => {
    try {
        next();
    } catch (error) {
        next(error);
    }
};