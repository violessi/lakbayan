export const checkUsernameExists = jest.fn();
export const createUserProfile = jest.fn();
export const getUsername = jest.fn().mockResolvedValue("mockuser");
export const getUserRole = jest.fn().mockResolvedValue("Moderator");
export const getUserPoints = jest.fn().mockResolvedValue(20);
export const getUserJoinedDate = jest.fn().mockResolvedValue("May 25, 2025");
export const logoutUser = jest.fn().mockResolvedValue(true);
