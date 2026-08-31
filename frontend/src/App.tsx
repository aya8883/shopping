import { Routes, Route } from 'react-router-dom';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import * as reactRouterDom from 'react-router-dom';
import { ConsumerLayout } from './layouts/ConsumerLayout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OffersPage } from './pages/OffersPage';
import { ComparePage } from './pages/ComparePage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { PlanBasketPage } from './pages/PlanBasketPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminLeafletsPage } from './pages/AdminLeafletsPage';

export default function App() {
  return (
    <Routes>
      {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI])}
      <Route element={<ConsumerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="plan" element={<PlanBasketPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="list" element={<ShoppingListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin/leaflets" element={<AdminLeafletsPage />} />
      </Route>
    </Routes>
  );
}
