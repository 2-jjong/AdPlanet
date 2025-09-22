import React from "react";
import { Html } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import back from "../../../assets/images/backicon.png";

interface OverlayProps {
  activePlanet: string;
  planetDes: string | null;
  route: string;
  resetView: () => void;
  goToNextPlanet: () => void;
}

const OverlayUI: React.FC<OverlayProps> = ({
  activePlanet,
  planetDes,
  route,
  resetView,
  goToNextPlanet,
}) => {
  const navigation = useNavigate();

  return (
    <Html fullscreen>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100vw",
          padding: "60px",
          boxSizing: "border-box",
          color: "white",
          height: "100vh",
          verticalAlign: "middle",
        }}
      >
        <div>
          <button
            style={{
              padding: "3px",
              background: "#2B2B2B",
              borderRadius: "100%",
              color: "white",
              cursor: "pointer",
            }}
            onClick={resetView}
          >
            <img src={back} alt='' />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "50px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{activePlanet}</div>
            <div style={{ fontSize: "18px", marginTop: "8px" }}>{planetDes}</div>
            <button
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                background: "#87DEDA",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigation(route)}
            >
              바로가기
            </button>
          </div>
          <div>
            <button
              style={{
                padding: "3px",
                background: "#2B2B2B",
                borderRadius: "100%",
                color: "white",
                cursor: "pointer",
              }}
              onClick={goToNextPlanet}
            >
              <img src={back} alt='' style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
};

export default OverlayUI;
