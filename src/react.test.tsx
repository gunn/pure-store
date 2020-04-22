import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import createStore from "./react"



const store = createStore({ count: 0 })
const Counter = ()=> {
  const [state, update] = store.usePureStore()

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={()=> update(s=> s.count++)}>+</button>
      <button onClick={()=> update(s=> s.count--)}>-</button>
    </div>
  )
}



let container: HTMLDivElement

beforeEach(()=> {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(()=> {
  document.body.removeChild(container)
  container = null
})

describe("Using a component with usePureStore()", ()=> {
  test("Renders as expected", ()=> {
    act(()=> { ReactDOM.render(<Counter />, container) })
  
    const count = container.querySelector("span").textContent
    expect(count).toBe("0")
  })

  test("Works with interaction and updates", async ()=> {
    act(()=> { ReactDOM.render(<Counter />, container) })

    const [inc, dec] = container.querySelectorAll("button") as unknown as HTMLButtonElement[]

    act(()=> {
      for (let i=0; i<12; i++) {
        inc.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }

      dec.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const count = container.querySelector("span").textContent
    expect(count).toBe("11")
  })
})
