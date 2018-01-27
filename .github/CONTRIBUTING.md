# Contributing to these demos

There are many ways you can contribute to these demos:

## Filing issues, fixing issues and improving the content
Some of these demos have been migrated from the old TestDrive website and might contain some bugs with some browsers or the code doesn't follow the latest standards. We've tried to do our best to prevent this but we all know things can happen. If you find a bug, open an issue. If you know how to fix it or improve a demo, do a Pull Request!

## Adding new demos
If you are interested in contributing with an interoperable, open source demo, open an issue and we will see how we can do that!

Thank you for contributing!

## Timelines

If your PR contains a new demo, it must be submitted **at least one week** in advance of the intended publication.

## Worfklow and requirements

### Setting up the project

1. Fork this project and [set up a remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) to file pull requests
against later.
2. [Install Node](https://nodejs.org/en/), then do an `npm install` from the root of the Demos repo to install linting dependencies.
3. Create a feature branch off of the master branch. Each new demo, or solution to an issue, gets its own branch / PR.
4. Review the [accessibility requirements](.github/ACCESSIBILITY_REQS.md) that your demo must meet. If you'd like help with design work, please chat with @melanierichards.

### Starting a new demo

Duplicate the `demo-template/` directory and start from there. Follow the instructions in the `index.html` file.

### Fixing issues

In your commit message, please include "fixes #issueNumber" or "ref #issueNumber", and a short, present-tense description of what you did.

### Submitting a pull request

1. Lint your work using `npm run lint:css -- demoDirectoryName/**/*.css` and `npm run lint:js -- demoDirectoryName/**/*.js`. You can add a `--fix` flag to the end of the CSS linting command, and [the linter](https://stylelint.io/user-guide/cli/) will fix as much as it can.
2. Update your feature branch with any new commits from MicrosoftEdge/Demos/master.
3. Check your PR one last time for [accessibility issues](.github/ACCESSIBILITY_REQS.md).
4. Create a pull request against MicrosoftEdge/Demos/master with the changes from your branch. Title with the name of your demo or fixes. Mention [`@molant`](https://github.com/molant) and optionally [`@melanierichards`](https://github.com/melanierichards) (for front-end/design review) in the comments so we're aware of your PR.
5. Push any changes based on feedback to your feature branch. This will update the PR with the most recent changes.