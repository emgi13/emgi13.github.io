import { LOGO_LAYERS } from "../assets/logos";
import Atropos from "atropos/react";
import "./Logo3D.scss";

let key_id = 0;

const Logo3D = () => {
  const repeat = 3;
  const start = -5;
  const diff = 1;
  return (
    <div className="logo-3d-cont">
      <Atropos className="logo-3d-atropos" shadow={false} highlight={false}>
        {LOGO_LAYERS.reverse().map((v, i) => {
          let divs = [];
          for (let ind = 0; ind < repeat; ind++) {
            divs.push(
              <div
                className="logo-layer"
                data-atropos-offset={start + i * diff + (diff * ind) / repeat}
                key={"3d-logo-layer-" + key_id++}
              >
                {v}
              </div>,
            );
          }
          return divs;
        })}
      </Atropos>
      <div className="logo-3d-helper">
        Tap and drag on the logo/hover with your mouse on the logo for 3D
        effects.
      </div>
    </div>
  );
};

export default Logo3D;
