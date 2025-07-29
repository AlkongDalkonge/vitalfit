import "./Header.css";
import { useIcons, useDate } from "../../utils/hooks";

export default function Header({ activeMenu = "직원" }) {
  const { getMenuIcon } = useIcons();
  const { getFormattedDate } = useDate();

  const IconComponent = getMenuIcon(activeMenu);

  return (
    <header className="header">
      <div className="header-title">
        <IconComponent size={24} style={{ marginRight: 8 }} />
        {activeMenu}
      </div>
      <div className="header-info">
        <span className="header-date">{getFormattedDate()}</span>
        <div className="header-user">
          <img
            src="https://placehold.co/32x32"
            alt="profile"
            className="header-avatar"
          />
          <span className="header-username">관리자</span>
        </div>
      </div>
    </header>
  );
}
