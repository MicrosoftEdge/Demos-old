# Contributing

Thanks for your interest in contributing! There are many ways to contribute: filing issues, fixing bugs, improving content, and adding new demos. All these ways are very much appreciated.

In order to have the smoothest pull request experience, we suggest reading the following guidelines so you know what to expect:

* [Timelines](#timelines)
* [Workflow](#workflow)
* [Code style requirements](#code-style-requirements)
* [Demo template](#demo-template)

## Timelines

If your PR contains a new demo, it must be submitted **at least one week** in advance of the intended publication.

## Worfklow and requirements

### Setting up the project

1. Fork this project and [set up a remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) to file pull requests
against later.
2. [Install Node](https://nodejs.org/en/), then do an `npm install` from the root of the Demos repo to install linting dependencies.
3. Create a feature branch off of the master branch. Each new demo, or solution to an issue, gets its own branch / PR.
4. Review the [accessibility requirements](.github/ACCESSIBILITY_REQS.md) that your demo must meet. If you'd like help with design work, please chat with @melanierichards.

### Fixing issues

In your commit message, please include "fixes #issueNumber" or "ref #issueNumber", and a short, present-tense description of what you did.

### Submitting a pull request

1. Lint your work using `npm run lint:css -- demoDirectoryName/**/*.css` and `npm run lint:js -- demoDirectoryName/**/*.js`. You can add a `--fix` flag to the end of the CSS linting command, and [the linter](https://stylelint.io/user-guide/cli/) will fix as much as it can.
2. Update your feature branch with any new commits from MicrosoftEdge/Demos/master.
3. Check your PR one last time for [accessibility issues](.github/ACCESSIBILITY_REQS.md).
4. Create a pull request against MicrosoftEdge/Demos/master with the changes from your branch. Title with the name of your demo or fixes. Mention [`@molant`](https://github.com/molant) and optionally [`@melanierichards`](https://github.com/melanierichards) (for front-end/design review) in the comments so we're aware of your PR.
5. Push any changes based on feedback to your feature branch. This will update the PR with the most recent changes.

## Code style requirements

We will be checking pull requests against the following guidelines and requirements:

* [Accessibility requirements](.github/ACCESSIBILITY_REQS.md)
* [CSS code style](.github/CSS_STYLE_REQS.md)

We will also ask you to lint your work using `npm run lint:css -- demoDirectoryName/**/*.css` and `npm run lint:js -- demoDirectoryName/**/*.js`. You can add a `--fix` flag to the end of the CSS linting command, and [the linter](https://stylelint.io/user-guide/cli/) will fix as much as it can.

## Demo template

Duplicate the `demo-template/` directory and start from there. **Be sure to add your demo's details in the meta data.**

### If you're creating an immersive experience

The demo template is quite permissive; it pretty much just adds a universal header to the top of the page. While we suggest chatting with @melanierichards about design needs, the demos are a nice place to explore different approaches. As long as your demo reflects a cheerful optimism and technical competency, it should be appropriate for this context.

### If you'd like your demo to be a more simple walkthrough (like @supports or css3filters)

We'd prefer that your demo follow Microsoft design styles more strictly and not reinvent the wheel for simple things. Here's how to do that:

1. Internal folks: chat with [`@melanierichards`](https://github.com/melanierichards)
2. Un-comment the [CSS file reference](demo-template/index.html#L11) in the head of the demo-template HTML file
3. Remove the [demo-header.js reference](demo-template/index.html#L20) in that same HTML file
4. Remove [config.json](demo-template/config.json) from the root directory of your demo. This config file tells dev.microsoftedge.com to display the demo in its own window instead of inline on the site, which would not be needed in this case.