// src/modules/Gallery3D/ImageModal.tsx
// 클릭 시 사진 크게 보기 모달

export default function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="preview"
          style={{ maxWidth: "80vw", maxHeight: "80vh", display: "block", borderRadius: 8 }}
        />
      </div>
    </div>
  );
}
