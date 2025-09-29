import React, { useState } from "react";
import { Button } from "../../../components/UI/Button/Button";
import { useGetTags } from "../hooks/query/useGetTags";
import { useAddTag } from "../hooks/mutation/useAddTag";
import { useTagSave } from "../hooks/mutation/useTagSave";
import Chip from "../../../components/UI/Chip/Chip";

interface LogoSaveModalProps {
  isOpen: boolean;
  logoId?: number;
  onClose: () => void;
  onSave: (categoryId: number[]) => void; //호출부로 전달
}

// ✅ 성공 알림 모달 컴포넌트
const SuccessAlert: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[60]'>
    <div className='bg-white rounded-lg shadow-xl w-[320px] p-6'>
      <h2 className='text-lg font-bold text-gray-800 mb-2 text-center'>카테고리 저장 성공!</h2>
      <p className='text-sm text-gray-600 mb-4 text-center'>
        선택한 카테고리가 정상적으로 저장되었습니다.
      </p>
      <div className='flex justify-center'>
        <button
          onClick={onClose}
          className='px-4 py-2 bg-background text-white rounded-md hover:bg-cyan-700'
        >
          확인
        </button>
      </div>
    </div>
  </div>
);

const LogoSaveModal: React.FC<LogoSaveModalProps> = ({ isOpen, onClose, onSave, logoId }) => {
  const [selectedCategories, setSelectedCategries] = useState<number[]>([]);
  const [customeCategory, setCustomCategory] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // ✅ 성공 알림 상태

  const { data: tags, error: tagsError, isLoading: tagsIsLoading } = useGetTags();
  const { mutate: addTag } = useAddTag();
  const { mutate: saveTags } = useTagSave(logoId!);

  if (tagsIsLoading) return <p>태그 목록 불러오는 중</p>;
  if (tagsError) return <p>에러 발생: {tagsError.message}</p>;

  const handleCategoryClick = (catId: number) => {
    setSelectedCategries((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
    setCustomCategory("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setSelectedCategries([]);
  };

  const handleSave = () => {
    if (selectedCategories.length === 0) {
      alert("카테고리를 하나 이상 선택해주세요.");
      return;
    }
    saveTags(
      { tagIds: selectedCategories }, // 서버 요구 형식
      {
        onSuccess: (res) => {
          if (res?.code === "S0000") {
            console.log("카테고리 저장 성공", res);
            setShowSuccess(true); // ✅ 성공 알림 모달 열기
            onSave(selectedCategories);
            setCustomCategory("");
            setSelectedCategries([]);
          } else {
            console.log("카테고리 저장 실패", res);
            alert("저장 실패");
          }
        },
        onError: (err) => {
          console.error("카테고리 저장 에러:", err);
          alert("저장 실패");
        },
      }
    );
  };

  const handleTagAdd = () => {
    if (!customeCategory) return;
    addTag(
      {
        name: customeCategory,
      },
      {
        onSuccess: (res) => {
          if (res?.code === "S0000") {
            console.log("태그 추가 성공", res);
            setSelectedCategries((prev) => [...prev, res.data.id]);
            setCustomCategory("");
          } else {
            console.log("태그 추가 실패");
            alert("태그 추가 중 오류가 발생했습니다.");
          }
        },
        onError: (err) => {
          console.error("태그 추가 실패:", err);
          alert("태그 추가 중 오류가 발생했습니다.");
        },
      }
    );
  };

  if (!isOpen) return null; // 닫혀있으면 렌더링 안 함

  return (
    <>
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='relative w-[520px] max-w-[92vw] rounded-2xl overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-indigo-600/20' />
          <div className='relative bg-[#0f1121]/95 text-white rounded-2xl shadow-2xl p-7'>
            {/* 닫기 버튼 */}
            <button
              className='absolute top-3 right-3 text-xl text-white/70 hover:text-white'
              onClick={onClose}
            >
              ✕
            </button>

            {/* 타이틀 */}
            <h2 className='text-2xl font-bold text-center mb-1'>자동 저장 완료!</h2>
            <p className='text-center text-sm mb-6 text-white/70'>
              저장된 로고의 카테고리를 설정해 주세요.
            </p>

            {/* 카테고리 버튼 */}
            <div className='flex flex-wrap justify-center gap-2.5 mb-6'>
              {tags?.data.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  selected={selectedCategories.includes(cat.id)}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))}
            </div>

            {/* 직접 카테고리 */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-white/80'>직접 카테고리 추가</label>
              <div className='flex flex-row gap-2'>
                <input
                  type='text'
                  placeholder='예: 아름다운'
                  value={customeCategory}
                  onChange={handleInputChange}
                  className='w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500'
                />
                <Button text='추가' variant='fill' size='xs' onClick={() => handleTagAdd()} />
              </div>
            </div>

            {/* Save 버튼 */}
            <div className='mt-6 flex justify-end'>
              <Button text='카테고리 저장' size='sm' variant='fill' onClick={handleSave} />
            </div>
          </div>
        </div>
      </div>

      {/* 성공 알림 모달 */}
      {showSuccess && (
        <SuccessAlert
          onClose={() => {
            setShowSuccess(false);
            onClose(); // 원래 모달 닫기
          }}
        />
      )}
    </>
  );
};

export default LogoSaveModal;
