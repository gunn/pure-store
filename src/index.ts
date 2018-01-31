import produce from "immer"


export class PureStore<S, T> {
  callbacks = []
  state?: S
  getter?: (s: S)=>T = null
  isTopLevelStore: boolean
  root: any

  constructor(state: S, getter?: (s: S)=>T, root?) {
    this.isTopLevelStore = !root
    this.root = root || this
    if (this.isTopLevelStore) this.state = state
    this.getter = getter || (s=> <T><any>s)
  }

  getState = (): T=> this.getter(this.root.state)

  update = (updater: ((e: T)=> void)|Partial<T>)=> {
    let updaterFn: (e: T)=> void

    if (updater instanceof Function) {
      updaterFn = updater
    } else {
      updaterFn = e=> Object.assign(e, updater)
    }

    this.root.state = produce(this.root.state, s=> {
      const baseObject = this.getter(s)
      updaterFn(baseObject)
    })

    this.callbacks.forEach(callback=> callback())
  }

  storeFor = <X>(getter: (s: S)=>X)=> (
    new PureStore(this.root.state, getter, this)
  )

  updaterFor = <X>(getter: (s: S)=>X)=> (
    (new PureStore(this.root.state, getter, this)).update
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
