module.exports = {


  friendlyName: 'Add lesson',


  description: '',


  files: ['photo'],


  inputs: {

    photo: {
      description: 'Upstream for an incoming file upload.',
      type: 'ref'
    },

    label: {
      type: 'string',
      description: 'A (very) brief description of the item.'
    },

  },


  exits: {

    success: {
      outputDescription: 'The newly created `Lesson`.',
      outputExample: {}
    },

    noFileAttached: {
      description: 'No file was attached.',
      responseType: 'badRequest'
    },

    tooBig: {
      description: 'The file is too big.',
      responseType: 'badRequest'
    },

  },


  fn: async function ({photo, label}) {

    var url = require('url');
    var util = require('util');

    // Upload the image.
    var info = await sails.uploadOne(photo, {
      maxBytes: 3000000
    })
      // Note: E_EXCEEDS_UPLOAD_LIMIT is the error code for exceeding
      // `maxBytes` for both skipper-disk and skipper-s3.
      .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
      .intercept((err)=>new Error('The photo upload failed: '+util.inspect(err)));

    if(!info) {
      throw 'noFileAttached';
    }

    // Create a new "lesson" record.
    var newLesson = await Lesson.create({
      imageUploadFd: info.fd,
      imageUploadMime: info.type,
      label,
      owner: this.req.me.id
    }).fetch();

    var imageSrc = url.resolve(sails.config.custom.baseUrl, '/api/v1/Lesson/'+newLesson.id+'/photo');

    // Return the newly-created lesson, with its `imageSrc`
    return {
      id: newLesson.id,
      imageSrc
    };

  }

};
