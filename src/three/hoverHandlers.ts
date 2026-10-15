import type { ThreeEvent } from '@react-three/fiber'
import { getInfo } from '../data/catalog'
import { useStore } from '../store'
import { focusBody } from '../lib/focus'

/**
 * Pointer handlers for a body: mouse hover shows the floating card (touch has
 * no hover, so it is skipped there); click / tap selects the body, opens its
 * info panel and flies the camera to it.
 */
export function bodyHandlers(id: string) {
  const info = getInfo(id)
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.nativeEvent.pointerType === 'touch' || !info) return
      useStore.getState().setHover(info)
      useStore.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY)
      document.body.style.cursor = 'pointer'
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (e.nativeEvent.pointerType === 'touch') return
      useStore.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY)
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (useStore.getState().hover?.id === id) useStore.getState().setHover(null)
      document.body.style.cursor = 'auto'
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      useStore.getState().setHover(null)
      focusBody(id)
    },
  }
}
