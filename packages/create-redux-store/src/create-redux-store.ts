import {createStore, combineReducers, applyMiddleware} from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import {userReducer} from '@stencil/user-reducer';

export function createReduxStore({reducers = {}, initialState = undefined}) {
  const middlewares = [thunk];
  if (__CLIENT__ && __DEV__) {
    middlewares.push(logger);
  }
  return createStore(
    combineReducers({...userReducer, ...reducers}),
    initialState,
    applyMiddleware(...middlewares),
  );
}

export default createReduxStore;
