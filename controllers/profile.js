const getProfile = async (req, res) => {
  res.send('profile goes here.');
};

const editProfile = async (req, res) => {
  res.send('Edit profile here.');
};

const deleteProfile = async (req, res) => {
  res.send('Delete profile here.');
};

const getFollowers = async (req, res) => {
  res.send('User followers go here.');
}

const getFollowing = async (req, res) => {
  res.send('Accounts the User follows go here.')
};

const followUser = async (req, res) => {
  res.send('Follow user here.');
}

const unfollowUser = async (req, res) => {
  res.send('Unfollow user here.');
}  

module.exports = {
  getProfile,
  editProfile,
  deleteProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser 
};
