module.exports = {


  friendlyName: 'View lessons',


  description: 'Display "Lessons" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/lessons/available-lessons'
    }

  },


  fn: async function () {

    var url = require('url');

    // Get the list of things this user can see.
    var lessons = await Lesson.find({
      or: [
        // Friend things:
        { owner: { 'in': _.pluck(this.req.me.friends, 'id') } },
        // My things:
        { owner: this.req.me.id }
      ]
    })
      .populate('owner')
      .populate('borrowedBy');

    _.each(lessons, (lesson)=> {
      lesson.imageSrc = url.resolve(sails.config.custom.baseUrl, '/api/v1/lesson/'+lesson.id+'/photo');
      delete lesson.imageUploadFd;
      delete lesson.imageUploadMime;
    });

    // Respond with view.
    return {
      currentSection: 'lessons',
      lessons: lessons,
    };

  }


};
