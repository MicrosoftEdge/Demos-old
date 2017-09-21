# Contributing

Thanks for your interest in contributing! There are many ways to contribute: filing issues, fixing bugs, improving content, and adding new demos. All these ways are very much appreciated.

In order to have the smoothest pull request experience, we suggest reading the following guidelines so you know what to expect:

* [Timelines](#timelines)
* [Workflow](#workflow)
* [Code style requirements](#code-style-requirements)
* [Demo template](#demo-template)

## Timelines

If your PR contains a new demo, it must be submitted **at least one week** in advance of the intended publication.

## Workflow

1. Fork this project and [set up a remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) to file pull requests against later.
2. Create a feature branch for your new demo or code fix off of the master branch.
3. Before starting any work, and preferrably before designing the experience of your demo, review the [code style requirements](#code-style-requirements) that your demo must meet. If you'd like help with design work, please chat with @melanierichards.
4. Before creating a PR, make sure your feature branch is up to date with the latest changes to `MicrosoftEdge/Demos/master`.
5. Create a PR against MicrosoftEdge/Demos/master with the changes from your branch. Title with the name of your demo or fixes, and give a good description of the changes. If submitting a fix, your PR message should say something like `fixes #1234` so that the issue gets automagically linked to the PR. Mention [`@molant`](https://github.com/molant) and optionally [`@melanierichards`](https://github.com/melanierichards) (for front-end/design review) in the comments so we're aware of your PR.
6. Push any changes based on feedback to your feature branch. This will update the PR with the most recent changes.

## Code style requirements

We will be checking pull requests against the following guidelines and requirements:

* [Accessibility requirements](.github/ACCESSIBILITY_REQS.md)
* [CSS code style](.github/CSS_STYLE_REQS.md)

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