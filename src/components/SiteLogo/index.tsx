import { SITE_TITLE } from "../../consts";
import { LOGO_SMALL } from "../../assets/logos";
import "./SiteLogo.scss";

const SiteLogo = () => {
  return (
    <div className="SiteLogo">
      <LOGO_SMALL />
      <span>{SITE_TITLE}</span>
    </div>
  );
};

export default SiteLogo;
