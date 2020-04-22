import * as React from 'react'
import { PureStore } from "./index"


function useForceUpdate() {
  return React.useReducer(() => ({}), {})[1] as () => void
}

class PureStoreReact<S, T> extends PureStore<S, T> {
  usePureStore = ()=> {
    const forceUpdate = useForceUpdate()
    React.useEffect(()=> this.subscribe(forceUpdate), [])

    return [this.state, this.update] as const
  }
}


export default <S>(state: S)=> (
  new PureStoreReact(null, (s: S)=> s, state)
)

export { PureStoreReact as PureStore }
