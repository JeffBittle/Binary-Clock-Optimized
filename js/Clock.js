class Clock {
  constructor(_datetime) {
    this.osCanvas = document.createElement("canvas");
    this.osContext = this.osCanvas.getContext("2d");
    this.osCanvas.width = primaryCanvas.width;
    this.osCanvas.height = primaryCanvas.height;

    this.dateCache = document.createElement("canvas");
    this.dateCacheContext = this.dateCache.getContext("2d");
    this.dateCache.width = primaryCanvas.width;
    this.dateCache.height = 32;
    this.initDateCacheContext(36);

    this.timeCache = document.createElement("canvas");
    this.timeCacheContext = this.timeCache.getContext("2d");
    this.timeCache.width = primaryCanvas.width;
    this.timeCache.height = primaryCanvas.height - this.dateCache.height;

    this.barCanvas = document.createElement("canvas");
    this.barCanvasContext = this.barCanvas.getContext("2d");
    this.barCanvas.width = this.timeCache.width;
    this.barCanvas.height = this.timeCache.height;

    this.digitSheet = {};
    this.digitSheet.sprites = [];
    this.digitSheet.image = this.createDigitSheet(110, 64, 128);

    this.barProps = {
      barWidth: 75,
      barHeight: 20,
      barMargin: 2,
      barGroupSpacing: 20
    };
    this.barLocations = this.calcBarLocations(this.barProps);

    this.barCache = document.createElement("canvas");
    this.barCacheContext = this.barCache.getContext("2d");
    this.barCache.width = this.barProps.barWidth + (this.barProps.barMargin * 3);
    this.barCache.height = this.barProps.barHeight + (this.barProps.barMargin * 3);
    this.initBarCacheContext();

    this.digitLocations = this.calcDigitLocations(this.barProps);

    this.currentDateTime = _datetime || new Date();
    this.currentDateString = "";
    this.currentTimeString = "";
    this.currentTimeBinary = "";
    this.binaryGridArray = Array(4).fill(0).map(() => Array(6).fill(0));

    this.secondsToHue = createRemap(0, 60, 0, 360);

    this.showDate = true;
    this.showDigitalTime = true;
    this.showTimeInBinary = false; // Whether to show the binary of the actual time (Hours/Minutes/Seconds) or of the individual digits
    this.running = true;
    this.initHTMLInputs();
  }

  showTime(_staticDate) {
    if (this.running) {
      const newDateTime = _staticDate || new Date();
      if (newDateTime === this.currentDateTime) {
        console.log("Time Stops");
        return;
      }
      const seconds = newDateTime.getSeconds(),
        millis = newDateTime.getMilliseconds(),
        barHue = Math.floor(this.secondsToHue(seconds + (millis / 1000.0))),
        timeText = newDateTime.toLocaleTimeString(undefined, {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        dateText = newDateTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }).replace(",", ""),
        binaryTimeText = this.makeBinaryTimeString(timeText.replace(/:/g, ""));

      if (this.currentTimeBinary !== binaryTimeText) {
        this.currentTimeBinary = binaryTimeText;
        this.updateBinaryGridArray();
      }

      this.renderBinaryGrid(barHue);
      clearCanvasDirty(this.osContext, 0, 0, this.dateCache.width, this.dateCache.height);
      this.osContext.drawImage(this.barCanvas, 0, this.dateCache.height);

      if (this.currentTimeString !== timeText) {
        const separator = seconds % 2;
        this.currentTimeString = timeText;
        this.updateTimeCache(separator);
      }

      if (this.showDigitalTime) {
        this.osContext.drawImage(this.timeCache, 0, this.dateCache.height);
      }

      if (this.currentDateString !== dateText) {
        this.currentDateString = dateText;
        this.updateDateCache();
      }

      if (this.showDate) {
        this.osContext.drawImage(this.dateCache, 0, 0);
      }
    }
  }

  initBarCacheContext() {
    this.barCacheContext.shadowBlur = 3;
    this.barCacheContext.shadowOffsetX = 0;
    this.barCacheContext.shadowOffsetY = 0;
  }

  initDateCacheContext(_fontsize) {
    this.dateCacheContext.fillStyle = "white";
    this.dateCacheContext.font = _fontsize + "px Digital-7 Mono, monospace";
    this.dateCacheContext.textAlign = "center";
    this.dateCacheContext.textBaseline = "middle";
  }

  updateBarCache(_barHue) {
    this.barCacheContext.fillStyle = _barHue;
    this.barCacheContext.shadowColor = _barHue;

    clearCanvas(this.barCacheContext);
    this.barCacheContext.fillRect(this.barProps.barMargin, this.barProps.barMargin, this.barProps.barWidth, this.barProps.barHeight);
  }

  updateDateCache() {
    colorRect(this.dateCacheContext, 0, 0, this.dateCache.width, this.dateCache.height, "black");
    this.dateCacheContext.fillStyle = "white";
    this.dateCacheContext.fillText(this.currentDateString, Math.floor(this.dateCache.width / 2), Math.floor(this.dateCache.height / 2));
  }

  updateTimeCache(_separator) {
    const tempTimeArray = (_separator === 0) ? this.currentTimeString.replace(/:/g, " ").split("") : this.currentTimeString.split("");

    clearCanvas(this.timeCacheContext);
    for (let i = 0, len = this.digitLocations.cols.length, digit; i < len; i++) {
      switch (i) {
        case 2:
        case 5:
          if (tempTimeArray[i] === " ") {
            continue;
          } else {
            digit = 10;
          }
          break;
        default:
          digit = tempTimeArray[i].toString();
          break;
      }
      drawCenteredSprite(this.timeCacheContext, this.digitSheet, digit, this.digitLocations.cols[i], this.digitLocations.y, 1);
    }
  }

  updateBinaryGridArray() {
    let tempChar;

    for (let col = 0, count = 0, cols = this.binaryGridArray[0].length; col < cols; col++) {
      for (let row = 0, rows = this.binaryGridArray.length; row < rows; row++) {
        tempChar = this.currentTimeBinary.substr(count, 1);
        switch (tempChar) {
          case "0":
            this.binaryGridArray[row][col] = 0;
            break;
          case "1":
            this.binaryGridArray[row][col] = 1;
            break;
        }
        count++;
      }
    }
  }

  renderBinaryGrid(_hue) {
    colorRect(this.barCanvasContext, 0, 0, this.barCanvasContext.canvas.width, this.barCanvasContext.canvas.height, "rgba(0,0,0,0.4");
    for (let row = 0, rows = this.binaryGridArray.length, hueOffsetHSL; row < rows; row++) {
      hueOffsetHSL = `hsl(${(_hue + (row * 4)) % 360},100%,50%)`;
      this.updateBarCache(hueOffsetHSL);
      for (let col = 0, cols = this.binaryGridArray[0].length; col < cols; col++) {
        if (this.binaryGridArray[row][col] === 1) {
          drawSingleSprite(this.barCanvasContext, this.barCache, this.barLocations.cols[col], this.barLocations.rows[row]);
        }
      }
    }
  }

  createDigitSheet(_fontsize, _digitWidth, _digitHeight) {
    const digitCanvas = document.createElement("canvas"),
      digitCanvasContext = digitCanvas.getContext("2d");

    digitCanvas.width = 4 * _digitWidth;
    digitCanvas.height = 4 * _digitHeight;

    digitCanvasContext.fillStyle = "white";
    digitCanvasContext.font = _fontsize + "px Digital-7 Mono, monospace";
    digitCanvasContext.textAlign = "center";
    digitCanvasContext.textBaseline = "middle";
    digitCanvasContext.shadowColor = "black";
    digitCanvasContext.shadowBlur = 10;
    digitCanvasContext.shadowOffsetX = 0;
    digitCanvasContext.shadowOffsetY = 0;

    for (let i = 0, col, row, digit, sprite; i < 11; i++) {
      col = i % 4;
      row = Math.floor(i / 4);
      sprite = {
        x: col * _digitWidth,
        y: row * _digitHeight,
        cx: Math.round(_digitWidth / 2),
        cy: Math.round(_digitHeight / 2),
        w: _digitWidth,
        h: _digitHeight
      };

      if (i === 10) {
        digit = ":";
      } else {
        digit = i.toString();
      }

      this.digitSheet.sprites.push(sprite);
      digitCanvasContext.fillText(digit, col * _digitWidth + sprite.cx, row * _digitHeight + sprite.cy);
    }

    return digitCanvas;
  }

  calcBarLocations(_props) {
    const barLocations = {
      cols: [],
      rows: []
    };

    let tempX = Math.floor(this.barCanvas.width / 2) - (3 * _props.barWidth) - Math.floor(3.5 * _props.barMargin) - _props.barGroupSpacing,
      tempY = Math.floor(this.barCanvas.height / 2) - (2 * _props.barHeight) - Math.floor(1.5 * _props.barMargin);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        barLocations.cols.push(tempX);
        tempX += _props.barWidth;
        tempX += _props.barMargin;
      }
      tempX += _props.barGroupSpacing;
    }

    for (let i = 0; i < 4; i++) {
      barLocations.rows.push(tempY);
      tempY += _props.barHeight;
      tempY += _props.barMargin;
    }

    return barLocations;
  }

  calcDigitLocations(_props) {
    const digitLocations = {
      cols: [],
      y: Math.floor(this.timeCache.height / 2) + 3
    };

    let tempX = Math.floor(this.timeCache.width / 2) - Math.floor(2.5 * _props.barWidth) - Math.floor(3.5 * _props.barMargin) - _props.barGroupSpacing;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        digitLocations.cols.push(tempX);
        tempX += _props.barMargin;
        if (j < 1) {
          tempX += _props.barWidth;
        }
      }
      if (i < 2) {
        tempX += Math.floor(_props.barWidth / 2);
        tempX += Math.floor(_props.barGroupSpacing / 2);
        digitLocations.cols.push(tempX);
        tempX += Math.floor(_props.barGroupSpacing / 2);
        tempX += _props.barMargin;
        tempX += Math.floor(_props.barWidth / 2);
      }
    }

    return digitLocations;
  }

  numToBinaryString(_num, _length = 8) {
    if (_num < 0 || _num > 255 || _num % 1 !== 0) {
      throw new Error("Not a valid byte: " + _num);
    }

    return ("0000000" + _num.toString(2)).substr(-_length);
  }

  makeBinaryTimeString(_timeText) {
    const binaryModifier = this.boolToBit(this.showTimeInBinary) + 1;
    let binaryTimeString = "",
      tempNum;

    for (let i = 0, len = _timeText.length; i < len; i += binaryModifier) {
      tempNum = _timeText.substr(i, binaryModifier);
      binaryTimeString += this.numToBinaryString(+tempNum, 4 * binaryModifier);
    }
    return binaryTimeString;
  }

  boolToBit(_bool) {
    return _bool ? 1 : 0;
  }

  initHTMLInputs() {
    const inputs = document.querySelectorAll("input");

    for (let i = 0, len = inputs.length; i < len; i++) {
      inputs[i].addEventListener("change", this.handleInputEvents.bind(this));

      switch (inputs[i].name) {
        case "binaryDisplayType":
          if (inputs[i].value == "Binary Time") {
            inputs[i].checked = this.showTimeInBinary;
          } else if (inputs[i].value == "Binary-Coded Decimal") {
            inputs[i].checked = !this.showTimeInBinary;
          }
          break;
        case "showTime":
          inputs[i].checked = this.showDigitalTime;
          break;
        case "showDate":
          inputs[i].checked = this.showDate;
          break;
      }
    }
  }

  handleInputEvents(event) {
    switch (event.target.name) {
      case "binaryDisplayType":
        if (event.target.value == "Binary Time") {
          this.showTimeInBinary = event.target.checked;
        } else if (event.target.value == "Binary-Coded Decimal") {
          this.showTimeInBinary = !event.target.checked;
        }
        break;
      case "showTime":
        this.showDigitalTime = event.target.checked;
        break;
      case "showDate":
        this.showDate = event.target.checked;
        break;
    }
  }
}