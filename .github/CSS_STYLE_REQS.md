# CSS code style

We will be adding a CSS linter to the project, but for now, you can review the “house style” for CSS:

* [Naming Classes and IDs](#naming-classes-and-ids)
* [Formatting](#formatting)
  * [Capitalization](#capitalization)
  * [White Space and Indentations](#white-space-and-indentations)
  * [Selector Lists](#selector-lists)
  * [Functions](#functions)
  * [Comments](#comments)
  * [Formatting values](#formatting-values)
* [Declaration Order](#declaration-order)
* [Choosing Selectors](#choosing-selectors)
* [Maintaining Margins and Padding](#maintaining-margins-and-padding)
* [Media Queries](#media-queries)

## Naming Classes and IDs

* We prefer BEM, but understand that it can take a bit to get ramped up on. If you are familiar with BEM or are making edits to a demo that already uses BEM, name your classes after [this version of the BEM syntax](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/). Otherwise, at least stick to `.dash-separated` classes, and the rest of the naming guidelines in this list.
* IDs may become part of the URL, so should be concise and easy to type.
* Names should be human readable. Don’t use abbreviations for shorthand that would require a key in order to understand what they mean.
* Avoid using presentational classes (`.blue-box`) wherever possible. Use semantic classes instead, which describe the use of the markup you’re writing (`.pullout-quote`).

## Formatting

### Capitalization

All text within statements (e.g. selectors, properties, values, at-rules, etc.) must be lowercase, with the exception of:

* Text within strings should be the case required
* Text within `url()` should follow the case of the URL it represents
* Font names should use Title Case (e.g. "Helvetica Neue")
* CSS variable names should be camel case (e.g. `--baseColor`) to match JS variables and `currentColor`

**Example:**

```CSS
.module-name {
  border-bottom: 1px solid white;
  background: var(--baseColor) url("../images/myimage.png") no-repeat top left;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  color: #eee;
}
```

### White Space and Indentations

* Use tabs instead of spaces for indentation.
* Leave one space between the selector and the opening curly brace (`{`). The closing curly brace (`}`) should be placed on a new line, horizontally aligned to the start of the statement it closes.
* Leave one space after the colon that follows the property name.
* Leave one space before and after combinators in a selector, with the exception of the descendent combinator (as it is itself whitespace).
* Indent declarations one tab from the start of the enclosing statement.
* In functions, do not include white space after the opening parenthesis or before the closing parenthesis.

**Example:**

```CSS
selector {
  property: value;
  property: value;
}

selector {
  property: value;
}

/* Combinators */
selector selector,
selector + selector,
selector > selector {
  property: value;
}
```

### Selector Lists

Place each selector in a selector list on a new line, directly below the previous selector. The carriage return should be placed directly after the comma (,).

**Example:**

```CSS
.selector,
.another-selector,
.yet-another {
  property: value;
}
```

### Functions

* Do not include white space after the opening parenthesis or before the closing parenthesis.
* Include one space after commas inside functions, unless the line needs to wrap, in which case use a carriage return (see wrapping rules later in this document.)

**Example:**

```CSS
selector {
  property: function(value, value, value);
}
```

### Comments

#### File and section comments

* Each file should have a header comment block with the name, dependencies, notes, and any other meta data
* Section comments are preceded by two carriage returns
* The name of file or section should be UPPERCASE
* New lines should be started with a space followed by an asterisk (*) followed by a tab to line up each asterisk with the start and end asterisk, and offset the text
* The closing `*/` should also start with a space
* The name of the file in the header comment should be underlined by a line of `=`
* The name of the section in section comments should be underlined by a line of `-`
* See Comment Metadata section for details on how to tag things in comments

**Example:**

```CSS
/*
 *	CONTROLS
 *	=============================================
 *	@Dependencies: ../images/select-arrow.svg
 *	@Note:
 *		Anything pertinent here
 *	@TODO: Clean up the such and such
 */


/*
 *	LABELS
 *	---------------------------------------------
 */

```

#### Code comments

* Short comments go on one line, with a spacing in between the comment and `/*` and `*/`
* Long comments have a carriage return after the opening `/*`. Each line of the comment is indented by one tab.

**Example:**

```CSS
/* Short Comment */
selector {
  property: value;
}

/*
  Long form Comment
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
*/
selector {
  property: value;
}
```

#### Comment metadata

The meta-data key should start with an ampersand (@), initial uppercase letter, e.g. @Dependencies: base.css.

Currently we use the following meta-data keys:

* @Dependencies: resources that the CSS file relies on, such as images, fonts, or JS scripts.
* @Note: note about usage or to call out something that may not be obvious.
* @TODO: call out something that hasn't been completed yet and needs to be updated/fixed.
* @Bug: link to a bug either in the project or a browser. Optionally describe the bug if context is needed. Use with @Browser if calling out a browser bug.
* @Browser: notify if a piece of code is included for a particular browser (not needed if obvious, such as prefixes for old versions.)
* @HACK: call out an ugly hack; either a CSS hack to work around browser issues, or a hacky piece of code that should be cleaned up later. Include a URL here, too, that points to a description of browser-based hacks.


### Formatting values

* All strings must be surrounded by double straight quotes. Quotes within strings should use correct typographic quote marks, so escaping should not be needed in most cases.
* The URL inside the `url()` function must be surrounded by double straight quotes (`"`).
* Font names (as used in the `local()` function, and the font and font-family properties) should be surrounded by double straight quotes if the name contains one or more spaces or special characters, or starts with a number. Quotes should not be used if the name does not contain white space or special characters.
* If the value of a length is zero, the unit should be omitted.
* Positive numbers should not use `+` sign.
* Numbers greater than 0.0 and less than 1.0 should omit the leading zero.
* Use 3 digit hexadecimal notation where allowed.
* Use integers for the r, g, and b channels rather than percentages.
* When the hue doesn’t affect the colour in `hsl(a)`, use 0.

**Example:**

```CSS
/* Strings */
selector {
  property: "content of string with “quoted text” inside";
}

/* URL */
selector {
  property: url("../imgs/example.png");
}

/* Font names */
selector {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
}

/* Numbers */
selector {
  property: 0;
  property: 30px;
  property: .5;
}

/* Color Values - white in hex code, rgb(a), hsl(a) */
selector {
  color: #fff;
  color: rgb(255, 255, 255);
  color: hsl(0, 50%, 100%);
}
```

## Declaration Order

Declarations in a declaration block should be ordered by type. This is a bit more complex than ordering alphabetically (or by line length), but has the advantage of keeping related properties (e.g. `width` and `height`) together. In general, our types are modeled off CSS modules to make it predicable where a property belongs. There may be exceptions where a different grouping makes sense.

### Type Order

Type groups are ordered by importance, so that properties that are most critical (display, position, box-sizing, etc.) are included first and more easy to see when scanning.

These types include:

* Display
* Positioning
* Box Model
* Backgrounds
* Color
* Fonts/Text
* Decorative effects
* Transitions/Animations
* Other

### Order within types

Properties within types should be in logical order. That is, properties that are part of a short hand should follow the order when specified in the shorthand (e.g. `*-top`, `*-right`, `*-bottom`, `*-left`). `width` should be followed by `height` (as commonly specified), a property that enables a feature should be specified before the properties that control it. If there is no obvious logical order, they should be ordered alphabetically.

### Vendor prefixes

Vendor prefixed properties should be ordered by length (`-webkit-` first, `-o-` last) with the unprefixed version following the prefixed versions. See Vendor prefixes section for further guidance.

## Choosing Selectors

* Don’t use IDs as CSS selectors unless high specificity is desired. Using IDs via the attribute selector is ok: `[id="foo"]`, as it has the same specificity as a class.
* Keep selector specificity low (three levels max). One-level selectors are preferred, but use good judgement.
* Favor class-based selectors over element-based selectors, in case the markup changes.
* Favor element and attribute selectors over class selectors where the semantics should be enforced and the styles are generic to the whole site, e.g. `button[aria-pressed="true"]`, `[hidden]`.

## Maintaining Margins and Padding

* Use top margins wherever possible (as opposed to bottom margins, or doing addition work between one element’s margin and another).
* Use margins for spaces between siblings. Use padding for spacing around child elements.

## Media Queries

* Build responsiveness mobile-first, legacy first. That is, the base style should be the “mobile” size, with a max width set for old browsers that don’t understand media queries.
* Add styles for wider levels using media queries, building from the smallest media query up. Minimize use of mutually-exclusive media queries (queries with a min and max).
* Use `em` for media query values. Doing this ensures that when the user zooms in, the site will switch to the appropriate layout for how the text wraps at that zoom level.
* Don’t collect all responsive styles into a new stylesheet. We prefer that you keep media queries in the section of the stylesheet that the styles pertain to, but if you are starting a new demo and find it easier to maintain a "media queries" section of your stylesheet, that is fine. If you are providing a fix to a current demo, follow the structure the original author has in place.
* Add an empty line after the opening curly brace (`{`) and before the closing curly brace (`}`) of the media query.

```CSS
selector {
  display: block;
  width: 100%;
}

@media (min-width: 32rem) {

  selector {
    float: left;
    width: 50%;
  }

}

@media (min-width: 54rem) {

  selector {
    width: 25%;
  }

}
```