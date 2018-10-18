let primaryCanvas,
  primaryContext,
  clock1;

window.onload = function () {
  primaryCanvas = document.getElementById("canvasArea");
  primaryContext = primaryCanvas.getContext("2d");
  clock1 = new Clock();

  startAnimationLoop();
}

function drawAll() {
  //colorText(fgContext, fps.toFixed(2) + " fps", 2,12, "white", {fontStyle:"12px sans-serif"});
  clock1.showTime();
  clearCanvas(primaryContext);
  primaryContext.drawImage(clock1.osCanvas, 0, 0);
}