import * as React from 'react'
import * as ReactDOM from 'react-dom'

// import Perf from 'react-addons-perf'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'

import { sectionReducer } from "./reducers/sectionReducer"


import { Main } from './components/Main'

// global.Perf = Perf

const store = createStore(
    sectionReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunkMiddleware) // lets us dispatch() functions
);

ReactDOM.render(
    <Provider store={store}>
        <Main/>
    </Provider>,
    document.getElementById('mainReactContainer')
);
