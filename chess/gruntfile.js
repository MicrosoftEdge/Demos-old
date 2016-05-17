/* eslint strict: [2, "global"]
*/
'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			app: {
				files: { 'css/app.css': ['less/app.less'] }
			}
		},
		eslint: {
			options: {
				configFile: '../.eslintrc'
			},
			target: [
				'scripts/**/*.js',
				'!scripts/libs/**/*.js'
			]
		},
		watch: {
			files: [
				'Gruntfile.js',
				'less/**/*.less',
				'scripts/**/*.js'
			],
			tasks: ['default']
		}
	});


	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'eslint',
		'less'
	]);
};