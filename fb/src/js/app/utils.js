export const round = n => ~~(n + 0.5);
export const map = (value, inMin, inMax, outMin, outMax) => {
  return (
    (Math.max(inMin, Math.min(inMax, value)) - inMin)
    / (inMax - inMin)) * (outMax - outMin) + outMin;
};
