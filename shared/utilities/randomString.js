module.exports = () => {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 10);
    return timestamp + randomString;
  };
  