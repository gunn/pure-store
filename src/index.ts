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

    this.root.callbacks.forEach(callback=> callback.cb(callback.cbro))
  }

  storeFor   = <X>(getter: (s: T)=>X)=> new PureStore(this, getter)
  updaterFor = <X>(getter: (s: T)=>X)=> this.storeFor(getter).update

  subscribe = (callback,cbReturnObj)=> {
    if (this.root != this)
      throw "Only the top level store can be subscribed to."

    let index = this.callbacks.push({cb:callback,cbro:cbReturnObj})-1;
    return ()=> this.callbacks.splice(index, 1)
  }
}

export default <S>(state: S)=> (
  new PureStore(null, (s: S)=> s, state)
)
