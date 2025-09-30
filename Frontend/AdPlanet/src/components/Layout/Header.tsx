import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
const Header = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button>
        <img src={logo} width='150px' onClick={() => navigate("/")} />
      </button>
    </div>
  );
};

export default Header;
