const getComments = async (req, res) => {
  res.send('All comments under a goes here.');
}; 

const createComment = async (req, res) => {
  res.send('Create comment here.');
}

const editComment = async (req, res) => {
  res.send('Edit comment here.')
};

const deleteComment = async (req, res) => {
  res.send('Delete your comment here.');
};

module.exports = {
  getComments, 
  createComment,
  editComment,
  deleteComment
};
