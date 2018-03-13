'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		appPath: 'app',
    serverPath: 'lib',
    workerPath: 'worker',
    distPath: 'dist',
    concurrent: {
      dev: {
        tasks: [
          'nodemon',
          'node-inspector',
          'serve'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'imagemin',
      ],
      distServe: {
        tasks: ['nodemon', 'connect:dist:keepalive'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    less : {
      dev : {
        files : {
          '<%= appPath %>/compiled.css' : ['<%= appPath %>/*/*.less', '!<%= appPath %>/bower_components/*.less']
        }
      }
    },

		watch: {
			js: {
				files: [
          '<%= appPath %>/**/*.js',
          '!<%= appPath %>/bower_components/**/*.js',
          '<%= serverPath %>/**/*.js',
          '<%= workerPath %>/**/*.js'
        ],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: true
				}
			},
			styles: {
				files: ['<%= appPath %>/*/*.less', '!<%= appPath %>/bower_components/*.less'],
				tasks: ['less:dev']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= appPath %>/**/*.html',
          '!<%= appPath %>/bower_components/**/*.html',
					'<%= appPath %>/compiled.css',
					'<%= appPath %>/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= appPath %>/bower_components/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          nodeArgs: ['--debug'],
          env: {
            PORT: '3000'
          },
          watch: ['lib/**/*.js']
        }
      }
    },

    'node-inspector': {
      dev: {}
    },

		connect: {
			options: {
				port: 3001,
				hostname: '0.0.0.0',
				livereload: 35729
			},
			livereload: {
				options: {
					open: true,
					base: [
						'.tmp',
						'app'
					]
				}
			},
      dist: {
        options: {
          base: '<%= distPath %>'
        }
      }
		},

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= distPath %>/*',
            '!<%= distPath %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= distPath %>/scripts/{,*/}*.js',
            '<%= distPath %>/styles/{,*/}*.css',
            '<%= distPath %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= distPath %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= appPath %>/index.html',
      options: {
        dest: '<%= distPath %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= distPath %>/**/*.html'],
      css: ['<%= distPath %>/styles/**/*.css'],
      options: {
        assetsDirs: ['<%= distPath %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appPath %>',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= distPath %>'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appPath %>',
          src: '**/*.svg',
          dest: '<%= distPath %>'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= distPath %>',
          src: ['*.html', '**/*.html'],
          dest: '<%= distPath %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appPath %>',
          dest: '<%= distPath %>',
          src: [
            '**/*.{ico,txt,json}',
            '.htaccess',
            '**/*.html',
            'bower_components/**/*'
          ]
        },
	{
	  nonull: true,
	  expand: true, 
	  src: ['bower_components/font-awesome/fonts/*'],
	  flatten: true,
	  cwd: '<%= appPath %>',
	  dest: '<%= distPath %>/fonts'
	}]
      }
    },

		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish'),
				ignores: '<%= appPath %>/bower_components/**'
			},
			all: [
				'Gruntfile.js',
        '<%= serverPath %>/**/*.js',
				'<%= appPath %>/**/*.js',
        '<%= workerPath %>/**/*.js'
			]
		},

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: ['test/common']
        },
        src: [
          '<%= serverPath %>/**/*.spec.js',
          '<%= workerPath %>/**/*.spec.js'
        ]
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }

	});

	grunt.registerTask('default', [
		'newer:jshint',
    'mochaTest'
	]);

  grunt.registerTask('test', [
    'mochaTest'
  ]);

	grunt.registerTask('serve', function (target) {
    if (target === 'dev') {
      return grunt.task.run(['concurrent:dev']);
    } else if (target === 'dist') {
      return grunt.task.run(['build', 'concurrent:distServe']);
    } else {
      grunt.task.run([
        'autoprefixer',
        'connect:livereload',
        'watch'
      ]);
    }
	});

  grunt.registerTask('build', [
    'less:dev',
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);
};
