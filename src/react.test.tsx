import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import createStore from "./react"



const counterStore = createStore({ count: 0 })
const Counter = ()=> {
  const [state, update] = counterStore.usePureStore()

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

  test("Works with interaction and updates", ()=> {
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



const store = createStore({
  lists: [
    {
      date: new Date(),
      completed: false,
      items: [
        {
          name: "eggs",
          purchased: false
        },
        {
          name: "bread",
          purchased: true
        },
        {
          name: "eggs",
          purchased: false
        }
      ]
    },
    {
      date: new Date(+new Date() - 86400000),
      completed: true,
      items: [
        {
          name: "vinegar",
          purchased: true
        }
      ]
    }
  ]
})
const ShoppingApp = ()=> {
  const [state] = store.usePureStore()

  return (
    <div className="shopping-app">
      <h1>
        Shopping
        <small>
          { state.lists.length } { "lists, " }
          { state.lists.filter(d=> !d.completed).length } uncompleted
        </small>
      </h1>

      <NextDueList />
    </div>
  )
}

const NextDueList = React.memo(()=> {
  const [state, update] = store.usePureStore(s=> s.lists.find(l=> l.completed==false))

  // If there are no lists due:
  if (!state) return null

  const {date, completed, items} = state

  return (
    <div className="list">
      <h3>
        List for {date.toLocaleString()}
        <small>
          { items.length } items, { items.filter(d=> !d.purchased).length } unpurchased
        </small>
      </h3>

      <input
        type="checkbox"
        checked={completed}
        onChange={()=> update({ completed: !completed })}
      />

      <ul>
        {
          items.map((item, i)=>
            <li key={i}>
              <label>
                { item.name }

                <input
                  type="checkbox"
                  checked={completed}
                  onChange={e=> update(s=> s.items[i].purchased = e.target.checked)}
                />
              </label>
            </li>
          )
        }
      </ul>
    </div>
  )
})


describe("Using usePureStore with a getter", ()=> {
  test("Renders as expected", ()=> {
    act(()=> { ReactDOM.render(<ShoppingApp />, container) })

    const text = container.querySelector("h1 small").textContent
    expect(text).toBe("2 lists, 1 uncompleted")

    const listDescription = container.querySelector("h3 small").textContent
    expect(listDescription).toBe("3 items, 2 unpurchased")
  })

  test("Works with interaction and updates", async ()=> {
    act(()=> { ReactDOM.render(<ShoppingApp />, container) })

    act(()=> {
      const eggCheckbox = container.querySelector(".list ul input")

      eggCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const listDescription = container.querySelector("h3 small").textContent
    expect(listDescription).toBe("3 items, 1 unpurchased")


    act(()=> {
      const checkbox = container.querySelector(".list > input")
      checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const appDescription = container.querySelector("h1 small").textContent
    expect(appDescription).toBe("2 lists, 0 uncompleted")
  })
})



const renderStore = createStore({ count: 0 })
const RenderTest = React.memo(()=> {
  const [{ count }] = renderStore.usePureStore()

return <span>{ count } - { Math.random() }</span>
})


describe("Using a component with usePureStore()", ()=> {
  test("Re-renders with new values", ()=> {
    act(()=> { ReactDOM.render(<RenderTest />, container) })
    const value1 = container.querySelector("span").textContent

    act(()=> {
      renderStore.update(s=> s.count++)
      ReactDOM.render(<RenderTest />, container)
    })
    const value2 = container.querySelector("span").textContent

    expect(value1).not.toBe(value2)
  })

  test("Does not re-render with unchanged values", ()=> {
    act(()=> { ReactDOM.render(<RenderTest />, container) })
    const value1 = container.querySelector("span").textContent

    act(()=> {
      renderStore.update(s=> s.count = s.count)
      ReactDOM.render(<RenderTest />, container)
    })
    const value2 = container.querySelector("span").textContent

    expect(value1).toBe(value2)
  })
})
