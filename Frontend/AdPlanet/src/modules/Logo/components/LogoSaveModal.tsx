import React, { useState } from "react";
import { Button } from "../../../components/UI/Button/Button";
import { useGetTags } from "../hooks/query/useGetTags";
import { useAddTag } from "../hooks/mutation/useAddTag";
import { useTagSave } from "../hooks/mutation/useTagSave";

interface LogoSaveModalProps {
  isOpen: boolean;
  logoId?: number;
  onClose: () => void;
  onSave: (categoryId: number[]) => void; //호출부로 전달
}

const LogoSaveModal: React.FC<LogoSaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  logoId,
}) => {
  const [selectedCategories, setSelectedCategries] = useState<number[]>([]);
  const [customeCategory, setCustomCategory] = useState("");
  const {
    data: tags,
    error: tagsError,
    isLoading: tagsIsLoading,
  } = useGetTags();
  const { mutate: addTag, data, isPending, error } = useAddTag();
  const { mutate: saveTags } = useTagSave(logoId!);
  if (tagsIsLoading) return <p>태그 목록 불러오는 중</p>;
  if (tagsError) return <p>에러 발생: {tagsError.message}</p>;

  const handleCategoryClick = (catId: number) => {
    setSelectedCategries((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
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
            alert("카테고리가 저장되었습니다!");
            onSave(selectedCategories); // 필요 시 부모에도 전달
            setCustomCategory("");
            setSelectedCategries([]);
            onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-xl shadow-xl p-8 w-[480px] relative">
        {/* 닫기 버튼 */}
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>
          ✕
        </button>

        {/* 타이틀 */}
        <h2 className="text-2xl font-bold text-center mb-2">자동 저장 완료!</h2>
        <p className="text-center text-sm mb-6">
          저장된 로고의 카테고리를 설정해 주세요.
        </p>

        {/* 카테고리 버튼 */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {tags?.data.map((cat) => (
            <Button
              key={cat.id}
              text={cat.name}
              size="xs"
              variant={selectedCategories.includes(cat.id) ? "fill" : "outline"}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>

        {/* 직접 카테고리 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm">직접 카테고리 설정</label>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              placeholder="예: 아름다운"
              value={customeCategory}
              onChange={handleInputChange}
              className="w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm"
            />
            <Button
              text="추가하기"
              variant="fill"
              size="xs"
              onClick={() => handleTagAdd()}
            />
          </div>
        </div>

        {/* Save 버튼 */}
        <div className="mt-6 flex justify-end">
          <Button
            text="카테고리 저장"
            size="sm"
            variant="fill"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoSaveModal;
