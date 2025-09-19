import React, { useState } from "react";
import { Button } from "./Button";

interface LogoSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string) => void; //호출부로 전달
}

const categories = ["깔끔한", "자연적인", "인위적인", "만화적인"];

const LogoSaveModal: React.FC<LogoSaveModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customeCategory, setCustomCategory] = useState("");

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setCustomCategory("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setSelectedCategory(null);
  };

  const handleSave = () => {
    const category = selectedCategory || customeCategory;
    if (!category) {
      alert("카테고리를 선택하거나 입력해주세요.");
      return;
    }
    onSave(category);
    setCustomCategory("");
    setSelectedCategory(null);
    onClose();
  };
  if (!isOpen) return null; // 닫혀있으면 렌더링 안 함

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-gray-800 text-white rounded-xl shadow-xl p-8 w-[480px] relative'>
        {/* 닫기 버튼 */}
        <button className='absolute top-3 right-3 text-xl' onClick={onClose}>
          ✕
        </button>

        {/* 타이틀 */}
        <h2 className='text-2xl font-bold text-center mb-2'>자동 저장 완료!</h2>
        <p className='text-center text-sm mb-6'>저장된 로고의 카테고리를 설정해 주세요.</p>

        {/* 카테고리 버튼 */}
        <div className='flex flex-wrap justify-center gap-3 mb-6'>
          {categories.map((cat) => (
            <Button
              text={cat}
              size='xs'
              variant={selectedCategory === cat ? "fill" : "outline"}
              onClick={() => handleCategoryClick(cat)}
            />
          ))}
        </div>

        {/* 직접 카테고리 */}
        <div className='flex flex-col gap-2'>
          <label className='text-sm'>직접 카테고리 설정</label>
          <input
            type='text'
            placeholder='예: 아름다운'
            value={customeCategory}
            onChange={handleInputChange}
            className='w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
          />
        </div>

        {/* Save 버튼 */}
        <div className='mt-6 flex justify-end'>
          <Button text='카테고리 저장' size='sm' variant='fill' onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default LogoSaveModal;
