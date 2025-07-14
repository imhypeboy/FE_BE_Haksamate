import React from 'react';
import { TimetableSlot } from '@/types/subject';

interface TimetableProps {
    timetable: TimetableSlot[];
    days: string[];
    hours: number[]; // 예: [9, 10, 11, ...]
}

function getSubjectNames(
    slots: TimetableSlot[],
    day: string,
    hour: number
): string[] {
    // 해당 요일, 시간에 해당하는 슬롯(subject)만 필터링
    return slots
        .filter((slot) => {
            if (slot.dayOfWeek !== day) return false;
            const startH = parseInt(slot.startTime.split(':')[0], 10);
            const endH = parseInt(slot.endTime.split(':')[0], 10);
            // 해당 hour가 start <= hour < end 에 포함되는지 체크
            return startH <= hour && hour < endH;
        })
        .map((slot) => slot.subject.name);
}

export default function Timetable({ timetable, days, hours }: TimetableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
                <thead>
                <tr>
                    <th className="border px-2 py-1 bg-slate-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"></th>
                    {days.map((day) => (
                        <th
                            key={day}
                            className="border px-2 py-1 bg-slate-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {day}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {hours.map((hour) => (
                    <tr key={hour}>
                        <td className="border px-2 py-1 font-bold bg-slate-100 dark:bg-gray-800">
                            {hour}:00
                        </td>
                        {days.map((day) => {
                            const names = getSubjectNames(timetable, day, hour);
                            return (
                                <td
                                    key={day}
                                    className="border px-2 py-1 break-words bg-white dark:bg-gray-900"
                                >
                                    {names.length === 0
                                        ? ''
                                        : names.map((name, i) => (
                                            <span key={name + i} className="block">
                            {name}
                          </span>
                                        ))}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}