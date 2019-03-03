# pure-store

[![Build Status](https://travis-ci.org/gunn/pure-store.svg?branch=master)](https://travis-ci.org/gunn/pure-store)
[![Coverage Status](https://coveralls.io/repos/github/gunn/pure-store/badge.svg?branch=master)](https://coveralls.io/github/gunn/pure-store?branch=master)
[![npm](https://img.shields.io/npm/v/pure-store.svg)](https://www.npmjs.com/package/pure-store)
[![mit](https://img.shields.io/npm/l/pure-store.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/TypeScript-%E2%9C%93-007ACC.svg)](https://www.typescriptlang.org/)

> Just edit your app's state.

`pure-store` is a fast, simple, immutable state store that lets you update state directly (i.e. imperatively). It also works excellently with typescript.

## Comparison with redux
<img src="comparison.png" width="888" />

## API
To use `pure-store` effectively you need to create a store, and know how to use three methods.

### `createStore(initialState)`
Creates a new store with an initial state. You can create multiple indepandent stores, although usually one is enough.

```javascript
import createStore from 'pure-store'

const store = createStore({ count: 0 })
```

If you're using typescript, you can get type checking and autocompletion automatically with the rest of your `pure-store` usage:
```typescript
interface State {
  user: User
  messages: {
    user: User
    text: string
    starred?: boolean
  }[]
  lastMessageAt?: Date
  messageCount: number
}

const state: State = {
  user: getUser(),
  messages: []
}

const store = createStore(state)
```

### `state` / `getState()`
Returns the current state from the store.

```jsx
console.log("last message date:", store.getState().lastMessageAt)

const Messages = ()=> {
  const { user, messages, lastMessageAt } = store.state

  return (
    <div>
      <h3>Messages for {user.name}</h3>
      <ul>
        {
          messages.map(m=> (
            <Message message={m} />
          ))
        }
      </ul>
    </div>
  )
}
```

### `update(updater)`
Use this anytime you want to update store data. The `updater` argument can either be an object in which case it works just like react's `setState`, or it can be a function, in which case it's given a copy of the state which can be modified directly.

```javascript
store.update({ lastMessageAt: new Date() })

store.update(s=> {
  s.messageCount++
  s.messages.push(message)
  s.lastMessageAt = new Date()
})
```

### `subscribe(callback)`
To re-render components when you update the store, you should subscribe to the store. The `subscribe` method takes a callback that takes no arguments. It returns a method to remove that subscription. You can subscribe many times to one store.

The recommended way is to re-render your whole app - `pure-store` can make this very efficient because immutable state lets you use `React.PureComponent` classes.
```javascript
const render = ()=> {
  ReactDOM.render(<App />, document.getElementById('root'))
}

store.subscribe(render)
render()
```

You could also use forceUpdate within a component e.g.:
```javascript
class App extends React.Component {
  constructor() {
    store.subscribe(()=> this.forceUpdate())
  }
  //...
```
Within a funcional component you may want to use the following React Hook :
```js
const forceUpdate = () => {   const [x, forceUpdate] = useReducer((x) => x + 1, 0)   store.subscribe(() => forceUpdate()) }
```

### bonus: `storeFor(getter)` & `updaterFor(getter)`
These methods let you define a subset of the store as a shortcut, so you don't have to reference the whole chain every time.

```javascript
console.log(store.user.profile.address.city)
store.update(s=> s.user.profile.address.city = "Wellington")

// vs
const addressStore   = store.storeFor(s=> s.user.profile.address)
const addressUpdater = store.updaterFor(s=> s.user.profile.address)

// and then:
console.log(addressStore.state.city)
addressUpdater(a=> a.city = "Wellington")
```
Which can be useful in larger projects.

## Patterns

### Actions
Other state management libraries have a concept of using 'actions' and 'action creators' for controlled state updates. You may well find them unnecessary, but if you miss them, you can easily do something similar:

```jsx
// actions.js
import store from './store'
export function postMessage(text) {
  store.update(s=> {
    s.messages.push({
      user: s.user,
      text
    })
    s.lastMessageAt = new Date()
  })
}

// component.js
  //...
  <button onClick={()=> postMessage(this.props.text)} />
  //...

```

### Persistence
If you want to persist data between sessions, it can be done very simply. You just need a way to serialize and de-serialize your data. If you use only basic data types, you can use `JSON.stringify` and `JSON.parse`:
```javascript
const STORAGE_KEY = "myapp-data"
const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY))

const store = createStore(storedData || getDefaultData())

window.addEventListener("beforeunload", ()=> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state))
})
```

## Future

`pure-store` is stable now, and I do not anticipate a need to change the API. The focus for now is improving the documentation.
