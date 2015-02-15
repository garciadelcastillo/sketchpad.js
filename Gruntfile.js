module.exports = function(grunt) {

  var files = [ 'src/sketchpad.js' ]

  // Project configuration.
  grunt.initConfig({
    
    pkg: grunt.file.readJSON('package.json'),

    // concat step
    concat: {
      build: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.js': files
        }
      }
    },

    // uglify step
    uglify: {
      options: {
        banner: '/*! <%= pkg.casedName %>.js v<%= pkg.version %> | (c) 2015 <%= pkg.author %> */\n'
      },
      build: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  var build_steps = ['concat', 'uglify'];
  grunt.registerTask('default', build_steps );
  grunt.registerTask('build', build_steps);

};