// ui/src/state.test.ts
import { describe, expect, it } from 'vitest'
import { createStore } from './state'

describe('undo/redo', () => {
  it('canUndo/canRedo are both false on a fresh store', () => {
    const store = createStore()
    expect(store.canUndo()).toBe(false)
    expect(store.canRedo()).toBe(false)
  })

  it('undo has no effect when nothing was ever committed', () => {
    const store = createStore()
    const before = store.getState().options
    store.undo()
    expect(store.getState().options).toBe(before)
  })

  it('commitOptionsSnapshot then a change makes undo restore the pre-change value', () => {
    const store = createStore()
    const original = store.getState().options.columns
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 200 } })
    expect(store.getState().options.columns).toBe(200)

    store.undo()
    expect(store.getState().options.columns).toBe(original)
  })

  it('redo re-applies what undo just reverted', () => {
    const store = createStore()
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 200 } })
    store.undo()
    store.redo()
    expect(store.getState().options.columns).toBe(200)
  })

  it('a new commit after undo clears the redo stack (the standard editor behavior)', () => {
    const store = createStore()
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 200 } })
    store.undo()
    expect(store.canRedo()).toBe(true)

    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 50 } })
    expect(store.canRedo()).toBe(false)
    store.redo()
    expect(store.getState().options.columns).toBe(50)
  })

  it('multiple commits undo in reverse order (LIFO)', () => {
    const store = createStore()
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 100 } })
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 150 } })
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 200 } })

    store.undo()
    expect(store.getState().options.columns).toBe(150)
    store.undo()
    expect(store.getState().options.columns).toBe(100)
    store.undo()
    expect(store.getState().options.columns).toBe(120) // back to the original default
    expect(store.canUndo()).toBe(false)
  })

  it('items/activeItemId changes are never part of the options undo history', () => {
    const store = createStore()
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, columns: 200 } })
    store.setState({ activeItemId: 'some-item' })

    store.undo()
    // Undo reverts the options change; the unrelated activeItemId set is untouched.
    expect(store.getState().options.columns).toBe(120)
    expect(store.getState().activeItemId).toBe('some-item')
  })

  it('replaceOptions is undoable and notifies the history channel (unlike a plain setState)', () => {
    const store = createStore()
    let historyFired = 0
    store.subscribeHistory(() => {
      historyFired++
    })

    store.replaceOptions({ ...store.getState().options, columns: 300 })
    expect(store.getState().options.columns).toBe(300)
    expect(historyFired).toBe(1)
    expect(store.canUndo()).toBe(true)

    store.undo()
    expect(store.getState().options.columns).toBe(120)
    // undo() itself also fires the history channel.
    expect(historyFired).toBe(2)
  })

  it('caps history depth so an unbounded editing session cannot grow it forever', () => {
    const store = createStore()
    for (let i = 0; i < 60; i++) {
      store.commitOptionsSnapshot()
      store.setState({ options: { ...store.getState().options, columns: 100 + i } })
    }
    let undoCount = 0
    while (store.canUndo()) {
      store.undo()
      undoCount++
    }
    expect(undoCount).toBe(50)
  })
})
