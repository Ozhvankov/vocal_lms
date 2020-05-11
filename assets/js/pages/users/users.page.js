parasails.registerPage('users', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    users: [],

    // The "virtual" portion of the URL which is managed by this page script.
    virtualPageSlug: '',

    // Form data
    addUserFormData: {
      user: [
        {
          fullName: '',
          emailAddress: '',
          password: '',
          id:''
        }
      ]
    },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `addUserFormData`.
    formErrors: { /* … */ },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    // Success state when form has been submitted
    cloudSuccess: false,

    selectedUser: undefined,
    confirmBlockSelectedUserModalOpen: false,
  },

  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: new RegExp(/^\/users\/?([^\/]+)?/),

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickAddButton: function() {
      // Open the modal.
      this.goto('/users/new');
    },

    _clearAddUserModal: function() {
      this.goto('/users');
      // Reset form data.
      this.addUserFormData = {
        user: [
          {
            fullName: '',
            emailAddress: ''
          }
        ]
      };
      this.formErrors = {};
      this.cloudError = '';
    },

    closeAddUserModal: function() {
      this._clearAddUserModal();
    },

    clickAddMoreButton: function() {
      this.addUserFormData.user.push({
        fullName: '',
        emailAddress: ''
      });
    },




    clickBlockThisUser: function(userId) {
      this.selectedUser = _.find(this.users, {id: userId});
      this.confirmBlockSelectedUserModalOpen = true;
      //console.log('selectedUser',this.selectedUser);
      //this.$forceUpdate();
      this.goto('/users');
    },

    closeBlockSelectedUserModal: function() {
      this.selectedUser = undefined;
      this.confirmBlockSelectedUserModalOpen = false;
      this.cloudError = '';
    },




    handleParsingAddUserForm: function() {
      console.log('can you handle this?');
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = _.cloneDeep(this.addUserFormData);

      // Check whether there are any rows with a name but not an email.
      var isValidEmailAddress = parasails.require('isValidEmailAddress');
      var hasAtLeastOneInvalidFriend = !_.isUndefined(_.find(argins.user, (friend)=> {
        if((friend.fullName !== '' || friend.emailAddress !== '') && !isValidEmailAddress(friend.emailAddress)) {
          return true;
        }
        return false;
      }));

      if(hasAtLeastOneInvalidFriend) {
        this.formErrors.user = true;
        return;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      // Otherwise, trim out any empty rows before submitting.
      _.remove(argins.user, {fullName: '', emailAddress: ''});

      return argins;
    },

    submittedAddUserForm: function() {
      var invitedUser = _.filter(this.addUserFormData.user, (friend)=>{
        return friend.fullName !== '' && friend.emailAddress !== '';
      });
      console.log('invited user:',invitedUser);
      // Add the new user to the requests list
      this.me.outboundFriendRequests = this.me.outboundFriendRequests.concat(invitedUser);
      this.$forceUpdate();
      this._clearAddUserModal();
    },


    handleParsingBlockedUserForm: function() {
      return {
        id: this.selectedUser.id
      };
    },

    submittedBockedUserForm: async function(userId) {
      //this.selectedUser = _.find(this.users, {id: userId});
      // Remove this user from our friends list.
      //_.remove(this.me.friends, {id: this.selectedFriend.id});
      //_.find(this.selectedUser.id, {id: userId});
      // if(this.selectedUser.isBlocked = false) {
      //   this.selectedUser.isBlocked = true
      // }

      // Close the modal.
      //this.selectedUser = undefined;
      //await Cloud.blockUser.width({ id: userId});
      //_.remove(this.selectedUser.id, {id: userId});
      this.selectedUser = undefined;
     // this.$forceUpdate({user});
      this.confirmBlockSelectedUserModalOpen = false;

      this.cloudError = '';

    },


    handleParsingForm: function() {

      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.formData;

      // Validate full name:
      if(!argins.fullName) {
        this.formErrors.fullName = true;
      }

      // Validate email:
      var isValidEmailAddress = parasails.require('isValidEmailAddress');
      if(!argins.emailAddress || !isValidEmailAddress(argins.emailAddress)) {
        this.formErrors.emailAddress = true;
      }

      // Validate password:
      if(!argins.password) {
        this.formErrors.password = true;
      }

      // Validate password confirmation:
      if(argins.password && argins.password !== argins.confirmPassword) {
        this.formErrors.confirmPassword = true;
      }

      // Validate ToS agreement:
      if(!argins.agreed) {
        this.formErrors.agreed = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    }
  },
});
