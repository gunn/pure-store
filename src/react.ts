import * as React from 'react'
import { PureStore } from "./index"


function useForceUpdate() {
  return React.useReducer(() => ({}), {})[1] as () => void
}

class PureStoreReact<S, T> extends PureStore<S, T> {
  usePureStore                      (): readonly [T, (updater: Partial<T> | ((e: T) => void)) => void]
  usePureStore <X>(getter?: (s: T)=>X): readonly [X, (updater: Partial<X> | ((e: X) => void)) => void]
  usePureStore(getter?) {
    if (getter) {
      return new PureStoreReact(this, getter).usePureStore()
    }

    const forceUpdate = useForceUpdate()
    React.useEffect(()=> this.root.subscribe(forceUpdate), [])

    return [this.state, this.update] as const
  }
}


export default <S>(state: S)=> (
  new PureStoreReact(null, (s: S)=> s, state)
)

export { PureStoreReact as PureStore }
