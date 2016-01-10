module.exports = function(grunt) {

    grunt.initConfig({
        uncss: {
            dist: {
                files: [{
                    src: 'src/index.html',
                    dest: 'dist/public_html/css/tidy.css'
                }]
            }
        },
        cssmin: {
            dist: {
                files: [{
                    src: 'dist/public_html/css/tidy.css',
                    dest: 'dist/public_html/css/tidy.min.css'
                }]
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                //separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/js/bootstrap.js', 'src/js/hammer.js', 'src/js/cw.js', 'src/js/main.js'],
                // the location of the resulting JS file
                dest: 'dist/public_html/js/aggregated.js'
            }
        },
        uglify: {
            options: {
                //banner: '/*! aggregated <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/public_html/js/aggregated.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        processhtml: {
            dist: {
                files: {
                    'dist/public_html/index.html': ['src/index.html']
                }
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                deleteOriginals: true
            },
            assets: {
                files: [{
                    src: ['dist/public_html/index.html']
                }]
            }
        },
        copy: {
            default: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        src: ['src/*'],
                        dest: 'dist/public_html',
                        filter: 'isFile',
                        flatten: true,
                        dot: true
                    },

                    // includes files within path and its sub-directories
                    {
                        expand: true,
                        src: ['src/fonts/*'],
                        dest: 'dist/public_html/fonts',
                        filter: 'isFile',
                        flatten: true
                    },
                    //beta
                    {
                        expand: true,
                        src: ['src/beta/*'],
                        dest: 'dist/public_html/beta',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            },
            dev: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'dist/public_html/css',
                    dest: 'dist/public_html/css/',
                    src: [
                        'tidy.css'
                    ],
                    rename: function(dest, src) {
                        return dest + src.replace('.css', '.min.css');
                    }
                }, {
                    expand: true,
                    dot: true,
                    cwd: 'dist/public_html/js',
                    dest: 'dist/public_html/js/',
                    src: [
                        'aggregated.js'
                    ],
                    rename: function(dest, src) {
                        return dest + src.replace('.js', '.min.js');
                    }
                }]
            }
        },
        strip_code: {
            options: {
                start_comment: "test-code",
                end_comment: "end-test-code",
            },
            your_target: {
                // a list of files you want to strip code from
                src: "dist/public_html/js/*.js"
            }
        },
        clean: ["dist/public_html"]
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default tasks.
    grunt.registerTask('default', ['clean', 'copy:default', 'uncss', 'cssmin', 'concat', 'strip_code', 'uglify', 'processhtml', 'cacheBust']);
    grunt.registerTask('dev', ['copy:default', 'uncss', 'cssmin', 'concat', 'strip_code', 'uglify', 'processhtml', 'copy:dev', 'cacheBust']);

};