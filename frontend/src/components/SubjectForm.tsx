import React from 'react';
import Modal from 'react-modal';
import { Subject } from '@/types/subject';

interface SubjectFormProps {
    isOpen: boolean;
    onRequestClose: () => void;
    form: Subject;
    onChange: (field: keyof Subject, value: any) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isEdit: boolean;
    error?: string | null;
    timeOptions: string[];
    days: string[];
}

export default function SubjectForm({
                                        isOpen,
                                        onRequestClose,
                                        form,
                                        onChange,
                                        onSubmit,
                                        isLoading,
                                        isEdit,
                                        error,
                                        timeOptions,
                                        days,
                                    }: SubjectFormProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        onChange(name as keyof Subject, type === 'checkbox' ? checked : value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isEdit ? '과목 수정' : '과목 추가'}
            className="modal-content"
            overlayClassName="modal-overlay"
            shouldCloseOnOverlayClick={!isLoading}
            appElement={typeof window !== "undefined" ? document.body : undefined}
        >
            <h2 className="text-xl font-bold mb-4">{isEdit ? '과목 수정' : '과목 추가'}</h2>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (!isLoading) onSubmit();
                }}
                className="space-y-4"
            >
                <div>
                    <label className="block mb-1 font-semibold">과목명</label>
                    <input
                        type="text"
                        name="name"
                        className="w-full border px-2 py-1 rounded"
                        value={form.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                        maxLength={30}
                        placeholder="과목 이름을 입력하세요"
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">요일</label>
                    <select
                        name="dayOfWeek"
                        className="w-full border px-2 py-1 rounded"
                        value={form.dayOfWeek}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                    >
                        {days.map(day => (
                            <option value={day} key={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block mb-1 font-semibold">시작 시간</label>
                        <select
                            name="startTime"
                            className="w-full border px-2 py-1 rounded"
                            value={form.startTime}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                        >
                            <option value="">선택</option>
                            {timeOptions.map(t => (
                                <option value={t} key={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block mb-1 font-semibold">종료 시간</label>
                        <select
                            name="endTime"
                            className="w-full border px-2 py-1 rounded"
                            value={form.endTime}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                        >
                            <option value="">선택</option>
                            {timeOptions.map(t => (
                                <option value={t} key={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="required"
                        type="checkbox"
                        name="required"
                        className="accent-blue-600"
                        checked={form.required}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <label htmlFor="required" className="font-semibold select-none">
                        필수 과목 (체크 시 필수 과목으로 설정)
                    </label>
                </div>

                {error && (
                    <div className="text-red-500 font-medium text-sm">{error}</div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
                        disabled={isLoading}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold transition"
                        disabled={isLoading}
                    >
                        {isEdit ? '수정' : '추가'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}