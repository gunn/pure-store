import * as React from 'react'
import { PureStore } from "./index"


class PureStoreReact<S, T> extends PureStore<S, T> {
  usePureStore                      (): readonly [T, (updater: Partial<T> | ((e: T) => void)) => void]
  usePureStore <X>(getter?: (s: T)=>X): readonly [X, (updater: Partial<X> | ((e: X) => void)) => void]
  usePureStore(getter?) {
    if (getter) {
      return new PureStoreReact(this, getter).usePureStore()
    }

    const [_, setState] = React.useState(this.getState())

    React.useEffect(()=> {
      return this.subscribe(()=> setState(this.getState()))
    }, [])

    return [this.getState(), this.update] as const
  }
}


export default <S>(state: S)=> (
  new PureStoreReact(null, (s: S)=> s, state)
)

export { PureStoreReact as PureStore }
