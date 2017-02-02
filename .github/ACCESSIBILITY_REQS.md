# Accessibility

I can verify that the changes made by my PR meet all the following accessibility concerns:

## Content structure

* Content appears in a meaningful order [WCAG on meaningful order](https://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error-reversible.html)
* Heading and labels describe the relevant content [WCAG on headings and labels](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-descriptive.html)
* Heading and labels are each unique. Where that is not possible, there is enough context information that users can tell the difference between duplicated headings (think of this in the context of a document outline, where the user isn't reading the full text of the page but skimming through headings)
* The information or behavior of the content is not dependent on visual/audio formatting [WCAG on info and relationships](https://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation-programmatic.html)
* User agents and assistive technologies (AT) can parse all the content [WCAG on parsing](https://www.w3.org/TR/UNDERSTANDING-WCAG20/ensure-compat-parses.html)
* AT can gather information about, activate (or set) and keep up to date on the status of user interface controls in the content [WCAG on name, role, and value](https://www.w3.org/TR/UNDERSTANDING-WCAG20/ensure-compat-rsv.html)

## Focus and keyboard access

* Tab order matches the flow of the content [WCAG on tab order](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-order.html)
* Focus state is visible on all focusable items [WCAG on focus state](https://www.w3.org/TR/2012/NOTE-UNDERSTANDING-WCAG20-20120103/navigation-mechanisms-focus-visible.html)
* Focus doesn't trigger changes in context or activate functionality [WCAG on focus context](https://www.w3.org/TR/UNDERSTANDING-WCAG20/consistent-behavior-receive-focus.html)
* No keyboard traps: the user can remove focus from an item using the same input they used to place focus [WCAG on keyboard traps](https://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-trapping.html)
* The user can use a keyboard to complete any tasks on the page [WCAG on keyboard use](https://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-keyboard-operable.html)

## Flashes, motion, animation

* Nothing flashes more than 3 times a second [WCAG on flash thresholds](https://www.w3.org/TR/UNDERSTANDING-WCAG20/seizure-does-not-violate.html)
* When something moves, blinks, or scrolls for more than 5 seconds, users have a way to pause or stop that animation [WCAG on animation time limits](https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-pause.html)

## Audio and video

* If audio plays for more than 3 seconds, users have a way to pause or stop that audio or adjust its volume [WCA on audio control](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-dis-audio.html)
* Content is not dependent on audio/sensory info alone to convey information, indicate an action, prompt a response, or distinguish a visual element [WCAG on sensory indicators](https://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation-understanding.html)
* Pre-recorded media (anything not captured in real time, such as webcam feeds) have captions, audio descriptions, and a transcript [WCAG on captions (pre-recorded)](https://www.w3.org/TR/UNDERSTANDING-WCAG20/media-equiv-captions.html)
* Media captured in real time have captions [WCAG on captions (live)](https://www.w3.org/TR/UNDERSTANDING-WCAG20/media-equiv-real-time-captions.html)

## Text

* Text can be resized without assistive technology to +200%, without losing content or functionality. Exceptions: captions and images of text [WCAG on text resizing](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-scale.html)
* Text-in-image is not relied upon to convey information. Exceptions: when the info is dependent upon the image format, such as logos or typography samples [WCAG on images of text](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-text-presentation.html)
* The page language (English, for ex.) is set in metadata, and any exceptions to the main documentation language are noted using a `lang` attribute [WCAG on page language](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-doc-lang-id.html) and [WCAG on language parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html)

## Color

* Content is not dependent on color alone to convey information, indicate an action, prompt a response, or distinguish a visual element [WCAG on use of color](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-without-color.html)
* All text has a 4.5:1 color ratio against its background, tested via [AxE extension](https://chrome.google.com/webstore/detail/axe/lhdoppojpmngadmnindnejefpokejbdd) or in a contrast checker. Exceptions: logos, "incidental" text (decorative text, text in an inactive element) [WCAG on color contrast](https://www.w3.org/TR/2008/WD-UNDERSTANDING-WCAG20-20080430/visual-audio-contrast-contrast.html)

## Context

* All non-text content has a text alternative [WCAG on non-text content](https://www.w3.org/TR/UNDERSTANDING-WCAG20/text-equiv-all.html)
* The value of the page title is informative and specific to the current page [WCAG on page titles](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-title.html)
* Link text, wherever possible, informs the user of where the link goes without having to rely on other items for context. No "read more" links, for example. [WCAG on contextual links](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-refs.html)

## Controls and inputs

* Whenever a user has to input data or select something, there are sufficient instructions/labels to explain what's expected of the user (including any formatting they need to follow) [WCAG on labels and instructions](https://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error-cues.html)
* Changing the value of an input doesn't change page context without first making the user aware of those impending changes (so you could write the instructions/label for an input that lets the user know that the page content will change in a particular way) [WCAG on inputs and context](https://www.w3.org/WAI/GL/2011/WD-UNDERSTANDING-WCAG20-20110310/consistent-behavior-unpredictable-change.html)

## Errors

* For automatically-detected errors on inputs: users are made aware of the error, there is text describing the error and suggestions on how to fix it [WCAG on error identification](https://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error-identified.html) [WCAG on error suggestion](https://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error-suggestions.html)
* User input that results in a legal commitment, financial transaction, or modification to user-controllable data in data storage systems can be reversed, verified, or confirmed in case of errors [WCAG on error prevention](https://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error-reversible.html)

## Navigation

* There are multiple ways to navigate to a page within a set of pages. This one requires a little bit more thoughtful interpretation, so check out WCAG for [more information and examples on "multiple ways"](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-mult-loc.html) [WCAG on multiple ways](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-mult-loc.html)
* Navigational items that are repeated from page to page appear in a consistent order, unless the user has changed that order in some way [WCAG on consistent navigation](https://www.w3.org/TR/UNDERSTANDING-WCAG20/consistent-behavior-consistent-locations.html)
* Make it easy for users to identify and navigate through blocks of content, by identifying them visually and semantically [WCAG on bypassing blocks](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-skip.html)
* Provide controls so that users can jump over these blocks of content in the fewest steps possible (for example, if a block of content has lots of focusable items, consider a jump to skip over that block, or adding keyboard shortcuts)
 
## Misc

* When users need to complete an action within a set amount of time, [they are able to modify that time to a minimum of 10x the default value](https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-required-behaviors.html). Exceptions: security-essential timeouts or timeouts necessary for game play.
* Items that all function the same have consistent appearance and behaviors; the wheel is not reinvented from one area to another [WCAG on consistent identification](https://www.w3.org/TR/UNDERSTANDING-WCAG20/consistent-behavior-consistent-functionality.html)
* The page doesn't interfere with the functions of assistive technologies