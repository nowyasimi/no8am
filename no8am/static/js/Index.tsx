import * as React from "react";
import * as ReactDOM from "react-dom";

// import Perf from 'react-addons-perf'
import {applyMiddleware, combineReducers, createStore} from "redux";

import {Provider} from "react-redux";
import thunkMiddleware from "redux-thunk";

import {calendar} from "./calendar/CalendarReducer";
import {search} from "./search/SearchReducer";
import {sections} from "./sections/SectionReducer";

import {Main} from "./containers/Main";

// global.Perf = Perf

const store = createStore(
    combineReducers({calendar, search, sections}),
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunkMiddleware), // lets us dispatch() functions
);

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>,
    document.getElementById("mainReactContainer")
);
