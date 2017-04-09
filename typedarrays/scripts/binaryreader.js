(function (window) {
	'use strict';

	var BinaryReader = function (typedArray) {
		this.dataView = new DataView(typedArray.buffer);
		this.streamPosition = 0;
	};

	var exception = {
		readPastEnd: 0
	};

	var throwException = function (errorCode) {
		switch (errorCode) {
			case exception.readPastEnd:
				throw {
					name: 'readPastEnd',
					message: 'Read past the end of the file'
				};
		}
	};

	BinaryReader.prototype = {
		readUint8: function () {
			var result = this.dataView.getUint8(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 1);
			return result;
		},
		readInt8: function () {
			var result = this.dataView.getInt8(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 1);
			return result;
		},
		readUint16: function () {
			var result = this.dataView.getUint16(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 2);
			return result;
		},
		readInt16: function () {
			var result = this.dataView.getInt16(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 2);
			return result;
		},
		readUint32: function () {
			var result = this.dataView.getUint32(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 4);
			return result;
		},
		readInt32: function () {
			var result = this.dataView.getInt32(this.streamPosition, true);
			this._movePointerTo(this.streamPosition + 4);
			return result;
		},
		skipBytes: function (n) {
			this._movePointerTo(this.streamPosition + n);
		},
		seek: function (offset, origin) {
			/// <summary>Moves the stream offset to the location in relation to the origina</summary>
			/// <param name="offset" type="Number">The location to move to</param>
			/// <param name="origin" type="seekOrigin">The relative position to start the seek from</param>

			switch (origin) {
				case window.seekOrigin.begin:
					this._movePointerTo(offset);
					break;
				case window.seekOrigin.current:
					this._movePointerTo(this.streamPosition + offset);
					break;
				case window.seekOrigin.end:
					this._movePointerTo(this.dataView.byteLength + offset);
					break;
			}
		},
		readString: function (numChars) {
			var chars = [];
			for (var i = 0; i < numChars; i++) {
				chars[i] = this.readUint8();
			}
			return String.fromCharCode.apply(null, chars);
		},
		_movePointerTo: function (offset) {
			if (offset < 0) {
				this.streamPosition = 0;
			}
			else if (offset > this.dataView.byteLength) {
				throwException(exception.readPastEnd);
			}
			else {
				this.streamPosition = offset;
			}
		}
	};

	BinaryReader.prototype.readByte = BinaryReader.prototype.readUint8;

	window.BinaryReader = BinaryReader;

	window.seekOrigin = {
		begin: 1,
		current: 2,
		end: 3
	};
}(window));
