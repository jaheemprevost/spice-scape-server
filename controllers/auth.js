const getRegister = async (req, res) => {
  res.send('This is the registration page.');
}

const getLogin = async (req, res) => {
  res.send('This is the log in page');
};

const registerUser = async (req, res) => {
  res.send('This will register the user.');
}

const loginUser = async (req, res) => {
  res.send('This will authenticate the user.');
}

module.exports = {
  getRegister,
  getLogin,
  registerUser,
  loginUser
};
