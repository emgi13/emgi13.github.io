import React from "react";
import { Toc } from "@mui/icons-material";

import "./ToC.scss";

type ToCState = {
  open: boolean;
};

function isRead(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.top <= 0;
}
function isVisible(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight;
}
function showOverlay() {
  const overlay = document.getElementById("overlay")!;
  const body = document.body;

  overlay.style.display = "block";
  body.style.overflow = "hidden";
}

function hideOverlay() {
  const overlay = document.getElementById("overlay")!;
  const body = document.body;

  overlay.style.display = "none";
  body.style.overflow = "";
}

class ToC extends React.Component<{}, ToCState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      open: false,
    };
    document.getElementById("overlay")?.addEventListener("click", () => {
      this.setState({ open: false });
      return false;
    });
  }

  get headings() {
    const prose = document.querySelector(".prose")!;
    const targets = prose.querySelectorAll("h2, h3");
    const headings = Array.from(targets)
      .map((h) => ({
        id: h.id,
        text: h.textContent,
        level: parseInt(h.tagName.replace("H", ""), 10),
        visible: isVisible(h) ? (isRead(h) ? "read" : "visible") : "unread",
      }))
      .filter((h) => !!h.id);
    return headings;
  }
  render() {
    const { open } = this.state;
    if (open) {
      showOverlay();
    } else {
      hideOverlay();
    }
    return (
      <div className="ToC">
        <div className="sticker">
          <div className={"links-cont " + (open ? "" : "closed")}>
            <div className="links">
              {this.headings.map((h, ind) => (
                <button
                  className="nav-link"
                  key={ind}
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
                    className={"indent-" + h.level + " " + h.visible}
                    style={{ flex: h.level }}
                  ></div>
                  <span
                    className={"size-" + h.level}
                    style={{ flex: 128 - h.level }}
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
