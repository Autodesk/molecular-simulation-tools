import { fromJS } from 'immutable';

const loggingMiddleware = store => next => (action) => {
  const result = next(action);

  if (process.env.NODE_ENV !== 'production') {
    console.group(action.type);
    console.log('dispatching', fromJS(action).toJS());
    console.log('next state', fromJS(store.getState()).toJS());
    console.groupEnd(action.type);
  }

  return result;
};

export default loggingMiddleware;
