import { forwardRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import "../../styles/dropdown.scss";

const DropdownButton = forwardRef((props, ref) => {
  const { children, toggle, open } = props;

  return (
    <div
      onClick={toggle}
      className={`dropdown__button ${open ? "dropdown__button--open" : null}`}
      ref={ref}
    >
      {children}
      <span className="dropdown__toggle">
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </div>
  );
});

export default DropdownButton;