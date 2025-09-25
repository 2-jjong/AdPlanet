import React from 'react';
import { getAllPosterTags, createPosterTag, assignGroupTags } from '../../../services/posterService';

interface TagDialogProps {
  groupId: number;
  onClose: () => void;
  onSaved?: () => void;
}

type NormalizedTag = { id: number; name: string };

const TagDialog: React.FC<TagDialogProps> = ({ groupId, onClose, onSaved }) => {
  const [tags, setTags] = React.useState<NormalizedTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState<number[]>([]);
  const [newTagName, setNewTagName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const loadTags = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllPosterTags();
      const items = (res.data ?? []).map((t: any) => ({
        id: (t?.tagId ?? t?.id) as number,
        name: (t?.tagName ?? t?.name) as string,
      }));
      setTags(items);
    } catch (_) { /* noop */ }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadTags();
  }, [loadTags]);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => (
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    ));
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const res = await createPosterTag(name);
      const anyCreated = res.data as any;
      const createdId: number | undefined = anyCreated?.tagId ?? anyCreated?.id;
      const createdName: string = (anyCreated?.tagName ?? anyCreated?.name ?? name) as string;
      setNewTagName('');
      if (typeof createdId === 'number') {
        // 목록에 바로 추가하고 선택 처리
        setTags((prev) => {
          // 중복 방지
          const exists = prev.some((t) => t.id === createdId);
          return exists ? prev : [...prev, { id: createdId, name: createdName }];
        });
        setSelectedTagIds((prev) => [...prev, createdId]);
      }
    } catch (_) { /* noop */ }
  };

  const handleSave = async () => {
    if (!groupId) return;
    setIsSaving(true);
    try {
      await assignGroupTags(groupId, selectedTagIds);
      onClose();
      if (onSaved) onSaved();
    } catch (_) { /* noop */ }
    setIsSaving(false);
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='relative w-[520px] max-w-[92vw] rounded-2xl overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-indigo-600/20' />
        <div className='relative bg-[#0f1121]/95 text-white rounded-2xl shadow-2xl p-7'>
          <button className='absolute top-3 right-3 text-xl text-white/70 hover:text-white' onClick={onClose}>✕</button>
          <h2 className='text-2xl font-bold text-center mb-1'>태그 지정</h2>
          <p className='text-center text-sm mb-6 text-white/70'>저장된 포스터의 태그를 선택하거나 새로 만들어 주세요.</p>
          <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-1'>
            <div>
              <label className='text-sm text-white/80'>태그 목록</label>
              <div className='mt-2 flex flex-wrap justify-center gap-2.5'>
              {isLoading ? (
                <div className='text-white/60 text-sm'>불러오는 중...</div>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type='button'
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/15 text-white/80 hover:border-white/30'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
            </div>

            <div className='pt-2 border-t border-white/10'>
              <label className='text-sm text-white/80'>새 태그 생성</label>
              <div className='mt-2 flex gap-2'>
              <input
                type='text'
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder='예: 자연스러운'
                className='flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500'
              />
              <button
                type='button'
                onClick={handleCreateTag}
                className='px-4 py-2 rounded-md bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400'
              >
                생성
              </button>
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end'>
            <button onClick={onClose} className='px-4 py-2 rounded-md border border-white/15 text-white/80 hover:border-white/30 mr-2'>취소</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md bg-cyan-500 text-white font-medium ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-400'}`}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagDialog;


