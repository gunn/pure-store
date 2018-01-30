import produce from "immer"


export class PureStore<S, T> {
  callbacks = []
  state: S = null
  getter?: (s: S)=>T = null
  isTopLevelStore: boolean

  constructor(state: S, getter?: (s: S)=>T) {
    this.isTopLevelStore = !getter
    this.state  = state
    this.getter = getter || (s=> <T><any>s)
  }

  getState = (): T=> this.getter(this.state)

  update = (updater: ((e: T)=> void)|Partial<T>)=> {
    let updaterFn: (e: T)=> void

    if (updater instanceof Function) {
      updaterFn = updater
    } else {
      updaterFn = e=> Object.assign(e, updater)
    }

    this.state = produce(this.state, s=> {
      const baseObject = this.getter(s)
      updaterFn(baseObject)
    })

    this.callbacks.forEach(callback=> callback())
  }

  storeFor = (getter: (s: S)=>T)=> (
    new PureStore(this.state, getter)
  )

  updaterFor = (getter: (s: S)=>T)=> (
    (new PureStore(this.state, getter)).update
  )

  subscribe = callback=> {
    if (!this.isTopLevelStore) {
      throw "Only the top level store can be subscribed to."
    }

    this.callbacks.push(callback)
    return ()=> this.callbacks = this.callbacks.filter(c=> c !== callback)
  }
}


const createStore = <S>(state: S)=> (
  new PureStore(state, (s: S)=> s)
)

export default createStore
