/**
 * Per-frame tour state, written by the CameraRig and read (without React
 * re-renders) by scene objects and DOM overlays such as the scale bar.
 */
export const tourState = {
  /** continuous stop index: 0 = Sun … STOPS.length − 1 = Local Group */
  t: 0,
  /** 0 → 1 while flying out to the Local Group (galaxies fade in) */
  galaxyBlend: 0,
  /** scale applied to the whole solar system (shrinks to a dot when zooming out) */
  solarScale: 1,
  /** camera distance from the Sun, in AU */
  camDistAu: 0,
  /** real distance (AU) covered by one CSS pixel at the focus target */
  auPerPx: 0,
}
