import React from 'react';
import { Subject } from '@/types/subject';

interface SubjectListProps {
    subjects: Subject[];
    onEdit: (subject: Subject) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

export default function SubjectList({
                                        subjects,
                                        onEdit,
                                        onDelete,
                                        isLoading = false,
                                    }: SubjectListProps) {
    if (isLoading && subjects.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">과목을 불러오는 중...</p>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <ul className="space-y-2">
                <li className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                    등록된 과목이 없습니다. "과목 추가"를 눌러 추가해보세요.
                </li>
            </ul>
        );
    }
    
    return (
        <ul className="space-y-2">
            {subjects.map((subject) => (
                <li
                    key={subject.id}
                    className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                    <div>
                        <span className="font-semibold">{subject.name}</span>
                        <span className="mx-2 text-sm text-gray-600 dark:text-gray-300">{subject.dayOfWeek}</span>
                        <span className="mx-1 text-gray-500 dark:text-gray-400">
              {subject.startTime}~{subject.endTime}
            </span>
                        {subject.required && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded">필수</span>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <button
                            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
                            onClick={() => onEdit(subject)}
                            disabled={isLoading}
                        >
                            수정
                        </button>
                        <button
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
                            onClick={() => onDelete(subject.id!)}
                            disabled={isLoading}
                        >
                            삭제
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}