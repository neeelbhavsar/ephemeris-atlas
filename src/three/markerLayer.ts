/**
 * DOM layer for drei <Html> markers. By default <Html> portals into the
 * element events are connected to — with ScrollControls that is the scrolling
 * container, so markers would scroll away with the page. This fixed layer
 * (mounted in App) keeps them glued to the viewport.
 */
export const markerLayer: { current: HTMLElement } = {
  current: null as unknown as HTMLElement,
}
