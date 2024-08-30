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
    const targets = prose.querySelectorAll("h2, h3");
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
                <button
                  className="nav-link"
                  onClick={() => {
                    this.setState({ open: false });
                    document.querySelector(`#${h.id}`)!.scrollIntoView({
                      behavior: "auto",
                      block: "start",
                      inline: "nearest",
                    });
                  }}
                >
                  <div
                    className={"indent-" + h.level}
                    style={{ flex: h.level }}
                  ></div>
                  <span
                    className={"size-" + h.level}
                    style={{ flex: 64 - h.level }}
                  >
                    {h.text}
                  </span>
                </button>
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
