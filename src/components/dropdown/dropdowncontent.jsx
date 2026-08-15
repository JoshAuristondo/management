import { forwardRef } from "react";
import "../../styles/dropdown.scss";

const DropdownContent = forwardRef((props, ref) => {
  const { children, open, top } = props;
  return (
    <div
      className={`dropdown__content ${open ? "dropdown__content--open" : null}`}
      style={{ top: top ? `${top}px` : "100%" }}
      ref={ref}
    >
      {children}
    </div>
  );
});

export default DropdownContent;