export const getLastMessage = (message) => {
  return message?.length > 20 ? `${message?.slice(0, 20)} ...` : message;
};
