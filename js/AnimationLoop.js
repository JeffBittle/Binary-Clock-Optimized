let animationLoopRunning = false,
  lastFrameTime = 0,
  elapsedFrameTime = 0,
  lastFPSUpdate = 0,
  framesThisSecond = 0,
  fps = 10,
  frameID;

const fpsThrottle = fps, // used to set desired framerate at or below the display refresh rate
  fpsInterval = 1000 / fpsThrottle;

function startAnimationLoop() {
  if (!animationLoopRunning) {
    frameID = requestAnimationFrame(function (_currentTime) {
      drawAll();
      animationLoopRunning = true;
      lastFrameTime = lastFPSUpdate = _currentTime;
      framesThisSecond = 0;
      frameID = requestAnimationFrame(animationLoop);
    });
  }
}

function stopAnimationLoop() {
  animationLoopRunning = false;
  cancelAnimationFrame(frameID);
}

function animationLoop(_currentTime) {
  if (!animationLoopRunning) {
    return;
  }

  if (_currentTime > lastFPSUpdate + 1000) {
    fps = 0.25 * framesThisSecond + (1 - 0.25) * fps;

    lastFPSUpdate = _currentTime;
    framesThisSecond = 0;
  }

  elapsedFrameTime = _currentTime - lastFrameTime;

  if (elapsedFrameTime > fpsInterval) {
    lastFrameTime = _currentTime - (elapsedFrameTime % fpsInterval);
    framesThisSecond++;

    drawAll();
  }

  frameID = requestAnimationFrame(animationLoop);
}