module.exports = {


  friendlyName: 'Block user',


  description: '',


  inputs: {
    id: {
      description: 'The ID of the user to block.',
      type: 'number',
      example: 8381,
      required: true
    }
  },


  exits: {
    notFound: {
      description: 'There is no users request from a user with that ID.',
      responseType: 'notFound'
    },
    forbidden: {
      responseType: 'forbidden'
    },
  },


  fn: async function ({id}) {


    const blockUser = await User.findOne({
      id
    });
    //.populate('outboundFriendRequests', { id: this.req.me.id });

    if (!blockUser || blockUser.isBlocked === true) {
      throw 'notFound';
    }

    // Add the logged-in user to this person's friends, and add this person
    // to the logged-in user's friends.
    await User.update({ id })
      .set({
        isBlocked: true,
        //expectedReturnAt: expectedReturnAt
      });

    // Now remove from this person's outbound requests (which also automatically
    // removes from the logged-in user's inbound requests.)
    // await User.removeFromCollection(id, 'outboundFriendRequests')
    //   .members([this.req.me.id]);


  }


};
