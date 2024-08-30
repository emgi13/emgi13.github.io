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
  render() {
    const { open } = this.state;
    return (
      <div className="ToC">
        <div className={"links-cont " + (open ? "" : "closed")}>
          <div className="links">test</div>
        </div>
        <button
          className="toggle"
          onClick={() => this.setState({ open: !open })}
        >
          <Toc />
          <span>Table of Contents</span>
        </button>
      </div>
    );
  }
}

export default ToC;
