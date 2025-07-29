import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./Layout.css";
import AppRouter from "../../router/AppRouter";
import { useNavigation } from "../../utils/hooks";

export default function Layout() {
  const { activeMenu, handleMenuClick, handleLogoClick } = useNavigation();

  return (
    <div className="layout">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={handleMenuClick}
        onLogoClick={handleLogoClick}
      />
      <div className="layout-main">
        <Header activeMenu={activeMenu} />
        <main className="layout-content">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </div>
  );
}
