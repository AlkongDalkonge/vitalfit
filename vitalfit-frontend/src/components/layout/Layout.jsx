import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AppRouter from "../../router/AppRouter";
import { useNavigation } from "../../utils/hooks";

export default function Layout() {
  const { activeMenu, handleMenuClick, handleLogoClick, userInfo } =
    useNavigation();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={handleMenuClick}
        onLogoClick={handleLogoClick}
      />
      <div className="flex-1 flex flex-col ml-60 h-screen">
        <Header activeMenu={activeMenu} userInfo={userInfo} />
        <main className="flex-1 p-8 bg-white overflow-y-auto">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </div>
  );
}
