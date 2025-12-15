export const getLastMessage = (message = "", width = 0) => {
  if (!message) return "";

  const limit = width > 800 ? 20 : 10;
  return message.length > limit ? `${message.slice(0, limit)}...` : message;
};
