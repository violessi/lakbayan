export const getComments = jest.fn();
export const addComment = jest.fn();

export const getBookmarks = jest.fn().mockResolvedValue([]);
export const addBookmark = jest.fn().mockResolvedValue(undefined);
export const removeBookmark = jest.fn().mockResolvedValue(undefined);
export const countModVerifications = jest.fn().mockResolvedValue(29);
export const countGpsVerifications = jest.fn().mockResolvedValue(58);
export const countComments = jest.fn().mockResolvedValue(92);
export const getUserVote = jest.fn().mockResolvedValue(null);
export const getPoints = jest.fn().mockResolvedValue(5);
