import {configureStore} from '@reduxjs/toolkit';
import themeSlice from './themeSlice';
import popularSlice from './popularSlice';
import trendingSlice from './trendingSlice';
import favoriteSlice from './favoriteSlice';
import languageSlice from './languageSlice';
import searchSlice from './searchSlice';
import logger from 'redux-logger';

// 关于中间件的更多解释可参考：https://cn.redux.js.org/docs/advanced/Middleware.html
// const loggerCustom = storeAPI => next => action => {
//   console.log('dispatching', action);
//   let result = next(action);
//   console.log('next state', storeAPI.getState());
//   return result;
// };

const store = configureStore({
  reducer: {
    theme: themeSlice,
    popular: popularSlice,
    trending: trendingSlice,
    favorite: favoriteSlice,
    language: languageSlice,
    search: searchSlice
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware().concat(logger);
  },
});

export default store;
