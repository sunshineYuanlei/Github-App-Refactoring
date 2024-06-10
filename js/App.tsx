import React from 'react';
import { Provider } from 'react-redux';
import AppNavigator from './navigator/AppNavigators';
import store from './redux/store';

const App = () => {
  const App = AppNavigator();
  /**
   * 将store传递给App框架
   */
  return <Provider store={store}>
    {App}
  </Provider>;
};

export default App;




