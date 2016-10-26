/* eslint strict: [2, "global"]*/

'use strict';

module.exports = function (grunt) {
	require('time-grunt')(grunt);
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		eslint: {
			demos: {
				files: {src: ['**/*.js']},
				options: {
					configFile: '.eslintrc.json',
					ignorePath: '.eslintignore',
					quiet: true
				}
			}
		}
	});

	grunt.registerTask('test', ['eslint']);
	grunt.registerTask('default', 'test');
};