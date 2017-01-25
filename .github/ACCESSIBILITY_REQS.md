# Accessibility

I can verify that the changes made by my PR meet all the following accessibility concerns:

## Content structure
* Content appears in a meaningful order
* Heading and labels describe the relevant content
* Heading and labels are each unique. Where that is not possible, there is enough context information that users can tell the difference between duplicated headings (think of this in the context of a document outline, where the user isn't reading the full text of the page but skimming through headings)
* The information or behavior of the content is not dependent on visual/audio formatting
* User agents and assistive technologies (AT) can parse all the content
* AT can gather information about, activate (or set) and keep up to date on the status of user interface controls in the content

## Focus and keyboard access
* Tab order matches the flow of the content
* Focus state is visible on all focusable items
* Focus doesn't trigger changes in context or activate functionality
* No keyboard traps: the user can remove focus from an item using the same input they used to place focus
* The user can use a keyboard to complete any tasks on the page

## Flashes, motion, animation
* Nothing flashes more than 3 times a second
* When something moves, blinks, or scrolls for more than 5 seconds, users have a way to pause or stop that animation

## Audio and video
* If audio plays for more than 3 seconds, users have a way to pause or stop that audio or adjust its volume
* Content is not dependent on audio/sensory info alone to convey information, indicate an action, prompt a response, or distinguish a visual element
* Pre-recorded media (anything not captured in real time, such as webcam feeds) have captions, audio descriptions, and a transcript
* Media capture in real time have captions

## Text
* Text can be resized without assistive technology to +200%, without losing content or functionality. Exceptions: captions and images of text
* Text-in-image is not relied upon to convey information. Exceptions: when the info is dependent upon the image format, such as logos or typography samples
* The page language (English, for ex.) is set in metadata, and any exceptions to the main documentation language are noted using a `lang` attribute

## Color

* Content is not dependent on color alone to convey information, indicate an action, prompt a response, or distinguish a visual element
* All text needs a 4.5:1 color ratio against its background. [Here's a place where you can test color combos](http://leaverou.github.io/contrast-ratio/) Exceptions: logos, "incidental" text (decorative text, text in an inactive element)

## Context
* All non-text content has a text alternative
* The value of the page title is informative and specific to the current page
* Link text, wherever possible, informs the user of where the link goes without having to rely on other items for context

## Controls and inputs
* Whenever a user has to input data or select something, there are sufficient instructions/labels to explain what's expected of the user (including any formatting they need to follow)
* Changing the value of an input doesn't change page context without first making the user aware of those impending changes (so you could write the instructions/label for an input that lets the user know that the page content will change in a particular way)

## Errors
* For automatically-detected errors on inputs: users are made aware of the error, there is text describing the error and suggestions on how to fix it
* User input that results in a legal commitment, financial transaction, or modification to user-controllable data in data storage systems can be reversed, verified, or confirmed in case of errors

## Navigation
* There are multiple ways to navigate to a page within a set of pages. This one requires a little bit more thoughtful interpretation, so check out WCAG for [more information and examples on "multiple ways"](http://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-mult-loc.html)
* Navigational items that are repeated from page to page appear in a consistent order, unless the user has changed that order in some way
* Make it easy for users to identify and navigate through blocks of content, by identifying them visually and semantically
* Provide controls so that users can jump over these blocks of content in the fewest steps possible (for example, if a block of content has lots of focusable items, consider a jump to skip over that block, or adding keyboard shortcuts)
 
## Misc
* When users need to complete an action within a set amount of time, they are able to modify that time to a minimum of 10x the default value. Exceptions: security-essential timeouts or timeouts necessary for game play.
* Items that all function the same have consistent appearance and behaviors; the wheel is not reinvented from one area to another
* The page doesn't interfere with the functions of assistive technologies