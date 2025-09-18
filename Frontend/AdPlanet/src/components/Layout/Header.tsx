import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
const Header = () => {
  const navigate = useNavigate();

  return (
    <div>
      <img src={logo} width='150px' onClick={() => navigate("/")} />
    </div>
  );
};

export default Header;
