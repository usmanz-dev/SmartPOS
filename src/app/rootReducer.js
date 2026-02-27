import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../context/AuthContext';
import cartReducer from '../hooks/useCart';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

export default rootReducer;
