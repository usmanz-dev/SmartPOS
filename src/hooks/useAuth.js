import { useSelector, useDispatch } from 'react-redux';
import { logout, setUser, loginThunk } from '../context/AuthContext';
import { ROLES } from '../utils/formatCurrency';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector(s => s.auth);

  return {
    user, token, loading, error,
    login: (creds) => dispatch(loginThunk(creds)),
    logout: () => dispatch(logout()),
    setUser: (u) => dispatch(setUser(u)),
    isLoggedIn: !!user && !!token,
    hasRole: (...roles) => roles.includes(user?.role),
    isAdmin: () => [ROLES.SUPER_ADMIN, ROLES.STORE_ADMIN].includes(user?.role),
    isSuperAdmin: () => user?.role === ROLES.SUPER_ADMIN,
    isCashier: () => user?.role === ROLES.CASHIER,
    isInventory: () => user?.role === ROLES.INVENTORY_MANAGER,
  };
};
