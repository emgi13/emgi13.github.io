import React from "react";
import { Toc } from "@mui/icons-material";

import "./ToC.scss";

type ToCState = {
  open: boolean;
};

class ToC extends React.Component<{}, ToCState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      open: false,
    };
  }

  get headings() {
    const prose = document.querySelector(".prose")!;
    const targets = prose.querySelectorAll("h1, h2, h3");
    const headings = Array.from(targets)
      .map((h) => ({
        id: h.id,
        text: h.textContent,
        level: parseInt(h.tagName.replace("H", ""), 10),
      }))
      .filter((h) => !!h.id);
    return headings;
  }
  render() {
    const { open } = this.state;
    return (
      <div className="ToC">
        <div className="sticker">
          <div className={"links-cont " + (open ? "" : "closed")}>
            <div className="links">
              {this.headings.map((h) => (
                <a href={"#" + h.id}>{h.text}</a>
              ))}
            </div>
          </div>
          <button
            className="toggle"
            onClick={() => this.setState({ open: !open })}
          >
            <Toc />
            <span>Table of Contents</span>
          </button>
        </div>
      </div>
    );
  }
}

export default ToC;
