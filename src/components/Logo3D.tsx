import React, { Component } from "react";
import { LOGO_LAYERS } from "../assets/logos";
import Atropos from "atropos/react";
import "./Logo3D.scss";

let key_id = 0;

class Logo3D extends Component {
  render() {
    const repeat = 3;
    const start = -5;
    const diff = +1;
    return (
      <>
        <Atropos className="logo-3d-atropos" shadow={false}>
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
        {/* {LOGO_LAYERS.map((v) => v)} */}
      </>
    );
  }
}

export default Logo3D;
