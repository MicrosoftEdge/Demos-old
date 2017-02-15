# About these demos [![Build Status](https://travis-ci.org/MicrosoftEdge/Demos.svg?branch=master)](https://travis-ci.org/MicrosoftEdge/Demos)

This is a set of interoperable and open source demos. You can watch their live version in the [MS Edge Dev Site](https://dev.windows.com/en-us/microsoft-edge/testdrive/).
The main goal of this one is to show new web features (supported by Microsoft Edge) in a way that work across all modern browsers. If a feature
is supported in a browser and the demo doesn't work as expected you should file a bug!  

Some of these demos have been migrated from the old TestDrive website (sometimes because they are still relevant, some others because we are bit
too sentimental). Some others are new. In any case, we are working on adding more. We hope you find them interesting and helpful.

## Contributing

### Timelines

If your PR contains a new demo, it must be submitted **at least one week** in advance of the intended publication.

### Git workflow

1. Fork this project and [set up a remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) to file pull requests
against later.
2. Create a feature branch for your new demo off of the master branch.
3. Before starting any work, and preferrably before designing the experience of your demo, review the [accessibility requirements](.github/ACCESSIBILITY_REQS.md) that your demo must meet. If you'd like help with design work, please chat with @melanierichards.
4. Before creating a pull request, make sure your feature branch is up to date with the latest changes to MicrosoftEdge/Demos/master (the
remote you set up).
5. Create a pull request against MicrosoftEdge/Demos/master with the changes from your branch. Title with the name of your demo or fixes.
Mention [`@molant`](https://github.com/molant) and optionally [`@melanierichards`](https://github.com/melanierichards) (for front-end/design review) in the comments so we're aware of your PR.
6. Push any changes based on feedback to your feature branch. This will update the PR with the most recent changes.

### What code should I use?

Duplicate the `demo-template/` directory and start from there. Be sure to add your demo's details in the meta data.

#### If you're creating an immersive experience

The demo template is quite permissive; it pretty much just adds a universal header to the top of the page. While we suggest chatting with @melanierichards about design needs, the demos are a nice place to explore different approaches. As long as your demo reflects a cheerful optimism and technical competency, it should be appropriate for this context.

#### If you'd like your demo to be a more simple walkthrough (like @supports or css3filters)

We'd prefer that your demo follow Microsoft design styles more strictly and not reinvent the wheel for simple things. Here's how to do that:

1. Internal folks: chat with [`@melanierichards`](https://github.com/melanierichards)
2. Un-comment the [CSS file reference](demo-template/index.html#L11) in the head of the demo-template HTML file
3. Remove the [demo-header.js reference](demo-template/index.html#L20) in that same HTML file
4. Remove [config.json](demo-template/config.json) from the root directory of your demo. This config file tells dev.microsoftedge.com to display the demo in its own window instead of inline on the site, which would not be needed in this case.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.