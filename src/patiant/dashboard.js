module.exports = async (req, res) => {
  try {
    const { user } = req;

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
