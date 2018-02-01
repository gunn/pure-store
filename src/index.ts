import produce from "immer"


export class PureStore<S, T> {
  callbacks = []
  state?: T
  getter?: (s: S)=>T = null
  root: any

  constructor(rootState: S, getter?: (s: S)=>T, root?) {
    this.root = root || this
    this.getter = getter || (s=> <T><any>s)
    this.state = this.getter(rootState)
  }

  update = (updater: ((e: T)=> void)|Partial<T>)=> {
    let updaterFn: (e: T)=> void = <any>updater
    if (!(updater instanceof Function))
      updaterFn = e=> Object.assign(e, updater)

    this.root.state = produce(this.root.state, s=> {
      updaterFn(this.getter(s))
    })

    this.state = this.getter(this.root.state)
    this.callbacks.forEach(callback=> callback())
  }

  storeFor = <X>(getter: (s: S)=>X)=>
    new PureStore(this.root.state, getter, this)

  updaterFor = <X>(getter: (s: S)=>X)=>
    this.storeFor(getter).update

  subscribe = callback=> {
    if (this.root != this)
      throw "Only the top level store can be subscribed to."

    this.callbacks.push(callback)
    return ()=> this.callbacks.splice(this.callbacks.indexOf(callback), 1)
  }
}

export default <S>(state: S)=> (
  new PureStore(state, (s: S)=> s)
)
