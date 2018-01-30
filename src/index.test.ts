import createStore from "./index"


interface State {
  numberOfWalks: number
  animals: any[]
}

const state: State = {
  numberOfWalks: 2876,
  animals: [
    {
      name: "Aiofe",
      age: 6
    },
    {
      name: "Sen",
      age: 8
    }
  ]
}


const store = createStore(state)


test("Allows access to state", ()=> {
  const storeState = store.getState()

  expect(storeState.numberOfWalks).toBe(2876)
  expect(storeState.animals.length).toBe(2)
  expect(storeState.animals[1].name).toBe("Sen")
})

test("Simple function updates", ()=> {
  expect(store.getState().numberOfWalks).toBe(2876)

  store.update(s=> s.numberOfWalks++)

  expect(store.getState().numberOfWalks).toBe(2877)
})
