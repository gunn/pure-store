import produce from "immer"

export class PureStore<S, T> {
  callbacks = []
  rootState: T
  getter: (s: S)=>T
  root: any
  parent: any

  constructor(parent, getter: (s: S)=>T, rootState?: T) {
    this.parent = parent
    this.root = (parent && parent.root) || this
    if (!parent) this.rootState = rootState
    this.getter = (s: S)=> getter(parent ? parent.getter(s) : s)
  }

  getState = ()=> this.getter(this.root.rootState)
  get state() { return this.getState() }

  update = (updater: ((e: T)=> void)|Partial<T>)=> {
    const updaterFn = (updater instanceof Function) ?
      updater : e=> Object.assign(e, updater)

    this.root.rootState = produce(this.root.rootState, s=> {
      updaterFn(this.getter(s))
    })

    this.root.callbacks.forEach(callback=> callback())
  }

  storeFor   = <X>(getter: (s: T)=>X)=> new PureStore(this, getter)
  updaterFor = <X>(getter: (s: T)=>X)=> this.storeFor(getter).update

  subscribe = callback=> {
    if (this.root != this)
      throw "Only the top level store can be subscribed to."

    this.callbacks.push(callback)
    return ()=> this.callbacks.splice(this.callbacks.indexOf(callback), 1)
  }
}

export default <S>(state: S)=> (
  new PureStore(null, (s: S)=> s, state)
)
