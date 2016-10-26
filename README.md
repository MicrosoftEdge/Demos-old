# About these demos

This is a set of interoperable and open source demos. You can watch their live version in the [MS Edge Dev Site](https://dev.windows.com/en-us/microsoft-edge/testdrive/). 
The main goal of this one is to show new web features (supported by Microsoft Edge) in a way that work across all modern browsers. If a feature 
is supported in a browser and the demo doesn't work as expected you should file a bug!  

Some of these demos have been migrated from the old TestDrive website (sometimes because they are still relevant, some others because we are bit 
too sentimental). Some others are new. In any case, we are working on adding more. We hope you find them interesting and helpful.

## Contributing

### Git workflow

1. Fork this project and [set up a remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) to file pull requests 
against later. 
2. Create a feature branch for your new demo off of the master branch.
3. Before creating a pull request, make sure your feature branch is up to date with the latest changes to MicrosoftEdge/Demos/master (the 
remote you set up).
4. Create a pull request against MicrosoftEdge/Demos/master with the changes from your branch. Title with the name of your demo or fixes. 
Mention @molant and optionally @melanierichards (for front-end/design review) in the comments so we're aware of your PR.
5. Push any changes based on feedback to your feature branch. This will update the PR with the most recent changes.

### What code should I use?

Previously, we had a demo generator script that will set up a basic demo for you. That script needs to be updated, so for now check out the 
@supports, css3filters, or webaudiotuner demos for examples. Note that there are meta tags in the `<head>` of `index.html` that will need to 
be populated with information about your demo.

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
