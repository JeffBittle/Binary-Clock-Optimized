function colorRect(_ctx, _x, _y, _width, _height, _color) {
  _ctx.setTransform(1, 0, 0, 1, _x, _y);
  _ctx.fillStyle = _color;
  _ctx.fillRect(_x, _y, _width, _height);
}

function colorText(_ctx, _text, _x, _y, _color) {
  _ctx.fillStyle = _color;
  _ctx.fillText(_text, _x, _y);
}

function drawCenteredSprite(_ctx, _digits, _spriteIndex, _x, _y, _a) {
  let spr = _digits.sprites[_spriteIndex];

  _ctx.setTransform(1, 0, 0, 1, _x, _y);
  _ctx.globalAlpha = _a;
  _ctx.drawImage(_digits.image, spr.x, spr.y, spr.w, spr.h, -spr.cx, -spr.cy, spr.w, spr.h);
}

function drawSingleSprite(_ctx, _image, _x, _y, _a) {
  _ctx.setTransform(1, 0, 0, 1, _x, _y);
  _ctx.globalAlpha = _a;
  _ctx.drawImage(_image, 0, 0, _image.width, _image.height, 0, 0, _image.width, _image.height);
}

function clearCanvas(_ctx) {
  _ctx.setTransform(1, 0, 0, 1, 0, 0);
  _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
}

function clearCanvasDirty(_ctx, _sx, _sy, _w, _h) {
  _ctx.setTransform(1, 0, 0, 1, 0, 0);
  _ctx.clearRect(_sx, _sy, _w, _h);
}