module.exports = {


  friendlyName: 'View users',


  description: 'Display "Users" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/users/users'
    }

  },


  fn: async function () {
    var users = await User.find({
      where: {isSuperAdmin: false},
    });
    // Respond with view.
    return {
    currentSection: 'users',
    users: users,
    };
  }


};
