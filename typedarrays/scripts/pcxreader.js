/* global BinaryReader */
(function (window) {
	'use strict';

	var Pcx = function () {
		this.colorTablePixels = [];
		this.colorTable = [];
		this.xSize = 0;
		this.ySize = 0;
	};

	var rleBit = 192;
	var colorTableSize = 256;
	var paletteOffset = -769;

	var loadHeader = function (reader) {
		var header = {};

		header.manufacturer = reader.readByte();
		header.version = reader.readByte();
		header.encoding = reader.readByte();
		header.bitsPerPixel = reader.readByte();

		header.xmin = reader.readInt16();
		header.ymin = reader.readInt16();
		header.xmax = reader.readInt16();
		header.ymax = reader.readInt16();
		header.hdpi = reader.readInt16();
		header.vdpi = reader.readInt16();

		// Skip over the reserved header bytes
		reader.seek(49, window.seekOrigin.current);

		header.nPlanes = reader.readByte();
		header.bytesPerPlane = reader.readInt16();

		return header;
	};

	Pcx.prototype.load = function (typedArray) {
		var binaryReader = new BinaryReader(typedArray);
		this.header = loadHeader(binaryReader);
		binaryReader.seek(128, window.seekOrigin.begin);

		if ((this.header.version === 5) && (this.header.bitsPerPixel === 8) &&
			(this.header.encoding === 1) && (this.header.nPlanes === 1)) {

			this.xSize = this.header.xmax - this.header.xmin + 1;
			this.ySize = this.header.ymax - this.header.ymin + 1;

			var count = 0;

			while (count < this.xSize * this.ySize) {
				// When the process byte is less then 192 then it is an index into the color table.
				// If it greater then 192, then there are (processByte - 192) number of entries
				// in the color table of the *next* byte (colorByte)
				var processByte = binaryReader.readByte();

				if ((processByte & rleBit) === rleBit) {
					processByte &= 63;
					var colorByte = binaryReader.readByte();

					for (var index = 0; index < processByte; index++) {
						this.colorTablePixels[count] = colorByte;
						count++;
					}
				} else {
					this.colorTablePixels[count] = processByte;
					count++;
				}
			}

			binaryReader.seek(paletteOffset, window.seekOrigin.end);

			for (var index = 0; index < colorTableSize; index++) {
				this.colorTable[index] = {
					red: binaryReader.readByte(),
					green: binaryReader.readByte(),
					blue: binaryReader.readByte()
				};
			}
		}
	};

	Pcx.prototype.drawToCanvas = function (canvas) {
		var context = canvas.getContext('2d');
		var height = Math.min(this.ySize, canvas.height);
		var width = Math.min(this.xSize, canvas.width);
		var outputData = context.createImageData(width, height);

		for (var yIndex = 0; yIndex < height; yIndex++) {
			for (var xIndex = 0; xIndex < width; xIndex++) {
				var outputOffset = yIndex * (width * 4) + (xIndex * 4);
				var pcxOffset = yIndex * this.xSize + xIndex;
				var pixel = this.colorTable[this.colorTablePixels[pcxOffset]];

				outputData.data[outputOffset] = pixel.red;
				outputData.data[outputOffset + 1] = pixel.green;
				outputData.data[outputOffset + 2] = pixel.blue;
				outputData.data[outputOffset + 3] = 255;
			}
		}

		context.putImageData(outputData, 0, 0);
	};

	window.Pcx = Pcx;
}(window));
