import React, { PropsWithChildren, ReactNode, useState } from "react";
import { Bubble } from "brainly-style-guide";

export default function WithTooltip(props: PropsWithChildren<{
  tooltip: ReactNode;
  direction: "to-right" | "to-left",
  noMaxWidth?: boolean;
}>) {
  const [tooltipVisible, setTooltipVisibility] = useState(false);

  return (
    <div 
      className="bubble-tooltip-container"  
      onMouseEnter={_ => setTooltipVisibility(true)}
      onMouseLeave={_ => setTooltipVisibility(false)}
    >
      {props.children}
      {tooltipVisible && <Bubble className="bubble-tooltip" direction="top" style={{
        [props.direction === "to-left" ? "right" : "left"]: "1rem",
        maxWidth: props.noMaxWidth ? "unset" : "400px"
      }}>
        {props.tooltip}
      </Bubble>}
    </div>
  );
}