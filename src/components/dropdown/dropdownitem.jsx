import "../../styles/dropdown.scss";

const DropdownItem = ({ children, onClick }) => {
  return (
    <div className="dropdown__item" onClick={onClick}>
      {children}
    </div>
  );
};

export default DropdownItem;