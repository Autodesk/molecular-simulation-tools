import { fromJS } from 'immutable';

const loggingMiddleware = store => next => (action) => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(action.type);
    console.log('dispatching', fromJS(action).toJS());
  }

  const result = next(action);

  if (process.env.NODE_ENV !== 'production') {
    console.log('next state', fromJS(store.getState()).toJS());
    console.groupEnd(action.type);
  }

  return result;
};

export default loggingMiddleware;
