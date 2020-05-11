parasails.registerPage('available-lessons', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    lessons: [],

    // The "virtual" portion of the URL which is managed by this page script.
    virtualPageSlug: '',
    uploadFormData: {
      photo: undefined,
      label: '',
      previewImageSrc: ''
    },

    // Modals which aren't linkable:
    borrowLessonModalOpen: false,
    confirmDeleteLessonModalOpen: false,
    scheduleReturnModalOpen: false,
    confirmReturnModalOpen: false,


// For tracking client-side validation errors in our form.
  // > Has property set to `true` for each invalid property in `formData`.
  formErrors: { /* … */ },

  // Syncing / loading state
  syncing: false,

  // Server error state
  cloudError: '',

  selectedLesson: undefined,

  borrowFormSuccess: false,
  scheduleReturnFormSuccess: false
  },
  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: new RegExp(/^\/lessons\/?([^\/]+)?/),

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS); //todo ???
    this.lesson = this._marshalEntries(this.lesson);
  },
  mounted: async function() {
    //…
    this.$find('[data-toggle="tooltip"]').tooltip();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    //…
    _marshalEntries: function(entries) {
      // Marshal provided array of data and return the modified version.
      return _.map(entries, (entry)=>{

        var isBorrowed = !_.isNull(entry.borrowedBy);

        if(entry.owner.id === this.me.id) {
          entry.unavailable = false;
        }
        else if(!isBorrowed) {
          entry.unavailable = false;
        }
        else entry.unavailable = entry.borrowedBy.id !== this.me.id;
        return entry;
      });
    },

    clickAddButton: function() {
      // Open the modal.
      this.goto('/lessons/new');
    },

    closeUploadLessonModal: function() {
      this._clearUploadLessonModal();
    },

    _clearUploadLessonModal: function() {
      // Close modal
      this.goto('/lessons');
      // Reset form data
      this.uploadFormData = {
        photo: undefined,
        label: '',
        previewImageSrc: ''
        // track: undefined,
        // previewTrackSrc: '',
      };
      // Clear error states
      this.formErrors = {};
      this.cloudError = '';
    },

    handleParsingUploadLessonForm: function() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.uploadFormData;

      if(!argins.photo) {
        this.formErrors.photo = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return _.omit(argins, ['previewImageSrc']);
    },

    submittedUploadLessonForm: function(result) {
      var newItem = _.extend(result, {
        label: this.uploadFormData.label,
        isBorrowed: false,
        owner: {
          id: this.me.id,
          fullName: this.me.fullName
        }
      });

      // Add the new lesson to the list
      this.lesson.unshift(newItem);

      // Close the modal.
      this._clearUploadLessonModal();
    },

    changeFileInput: function(files) {
      if (files.length !== 1 && !this.uploadFormData.photo) {
        throw new Error('Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.');
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.uploadFormData.photo) {
        return;
      }

      this.uploadFormData.photo = selectedFile;

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = (event)=>{
        this.uploadFormData.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      this.formErrors.photo = false;
      reader.readAsDataURL(selectedFile);

    },


  }
});
