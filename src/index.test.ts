import createStore from "./index"


interface State {
  numberOfWalks: number
  animals: [
    {
      name: string
      age: number
      isBad?: boolean
    }
  ]
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
  const storeState = store.state

  expect(storeState.numberOfWalks).toBe(2876)
  expect(storeState.animals.length).toBe(2)
  expect(storeState.animals[1].name).toBe("Sen")
})

test("Allow function updates", ()=> {
  expect(store.state.numberOfWalks).toBe(2876)

  store.update(s=> s.numberOfWalks++)

  expect(store.state.numberOfWalks).toBe(2877)
})

test("Allow object updates", ()=> {
  store.update({numberOfWalks: 100})

  expect(store.state.numberOfWalks).toBe(100)
})

test("More Updating", ()=> {
  store.update(s=> s.animals.push({name: "Odin", age: 5}))

  expect(store.state.animals.length).toBe(3)
})

test("Using a sub-store", ()=> {
  const odinStore = store.storeFor(s=> s.animals[2])

  expect(odinStore.state.name).toBe("Odin")
  expect(odinStore.state.isBad).toBe(undefined)

  odinStore.update({isBad: true})
  expect(odinStore.state.isBad).toBe(true)
})


describe("Immutability", ()=> {
  const senStore = store.storeFor(s=> s.animals[1])

  test("Unmodified objects stay the same", ()=> {
    const before     = senStore.state
    const rootBefore = store.state.animals[1]
    expect(before).toBe(rootBefore)

    expect(before).toBe(senStore.state)
    expect(rootBefore).toBe(store.state.animals[1])
  })

  test("Modified objects are different objects", ()=> {
    const before     = senStore.state
    const rootBefore = store.state.animals[1]
    expect(before).toBe(rootBefore)

    senStore.update({isBad: false})

    expect(before).not.toBe(senStore.state)
    expect(rootBefore).not.toBe(store.state.animals[1])
  })
})

test("Updaters", ()=> {
  const aiofeUpdater = store.updaterFor(s=> s.animals[0])

  expect(store.state.animals[0].isBad).toBe(undefined)

  aiofeUpdater(aiofe=> aiofe.isBad = false)
  expect(store.state.animals[0].isBad).toBe(false)
})
