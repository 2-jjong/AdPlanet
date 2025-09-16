import React from 'react';
import LogoClean from '../assets/clean.png';
import LogoPunk from '../assets/punk.png';
import LogoCartoon from '../assets/cartoon.png';
import LogoMono from '../assets/mono.png';

interface StyleSelectionDialogProps {
  isOpen: boolean;
  onStyleSelect: (style: string) => void;
  onClose: () => void;
}

const styles = [
  { id: 'clean', src: LogoClean, label: '깔끔한', description: '미니멀하고 세련된 디자인' },
  { id: 'punk', src: LogoPunk, label: '펑크', description: '대담하고 역동적인 스타일' },
  { id: 'cartoon', src: LogoCartoon, label: '만화같은', description: '친근하고 재미있는 일러스트' },
  { id: 'monochrome', src: LogoMono, label: '흑백', description: '클래식하고 우아한 모노톤' },
];

const StyleSelectionDialog: React.FC<StyleSelectionDialogProps> = ({
  isOpen,
  onStyleSelect,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-primary/30 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">포스터 스타일 선택</h2>
          <p className="text-text-color/70">원하는 포스터 스타일을 선택해주세요</p>
        </div>

        {/* 스타일 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {styles.map((style) => (
            <div
              key={style.id}
              onClick={() => onStyleSelect(style.id)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
            >
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6 text-center hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                  <img
                    src={style.src}
                    alt={style.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-text-color mb-2 group-hover:text-primary transition-colors">
                  {style.label}
                </h3>
                <p className="text-sm text-text-color/60 group-hover:text-text-color/80 transition-colors">
                  {style.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="text-center">
          <p className="text-text-color/50 text-sm">
            선택한 스타일은 나중에 변경할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default StyleSelectionDialog;
