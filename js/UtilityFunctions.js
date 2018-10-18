const createRemap = function (_low1, _high1, _low2, _high2) {
  return function (_value) {
    return _low2 + (_high2 - _low2) * (_value - _low1) / (_high1 - _low1);
  };
};