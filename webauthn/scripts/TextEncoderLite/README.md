TextEncoderLite
==============

Extracted from [Feross' Buffer](https://github.com/feross/buffer) as a lightweight Pollyfill
for TextEncoder.

See also
  * [TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/encode) / [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/decode)
  * [DateView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
  * [text-encoding](https://github.com/inexorabletash/text-encoding)
  * [Unibabel](https://github.com/coolaj86/unibabel-js)
  * [TextEncoderLite (based on text-encoding)](https://github.com/coolaj86/TextEncoderLite/tree/lite)

### Install ###

There are a few ways you can get the `text-encoder-lite` library.

#### Node ####

`text-encoder-lite` is on `npm`. Simply run:

```js
npm install text-encoder-lite
```

Or add it to your `package.json` dependencies.

#### Bower ####

`text-encoder-lite` is on `bower` as well. Install with bower like so:

```js
bower install text-encoder-lite
```

Or add it to your `bower.json` dependencies.

### HTML Page Usage ###

```html
  <!-- Required for non-UTF encodings -->
  <script src="bower_components/text-encoder-lite/index.js"></script>
```

### API Overview ###

Basic Usage

```js
  var uint8array = TextEncoderLite('utf-8').encode(string);
  var string = TextDecoderLite('utf-8').decode(uint8array);
```

### Encodings ###

Only UTF-8 encoding is supported.
See [text-encoding](https://github.com/inexorabletash/text-encoding) for full support,
including multi-lingual non-standard encodings that aren't supported by TextEncoder proper.

If it seems beneficial I could bring in support for utf-16be, utf-16le, and x-user-defined.
