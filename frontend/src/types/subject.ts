// types/subject.ts
export interface Subject {
    id?: number;
    name: string;
    dayofweek: string;    // DB 컬럼과 동일!
    starttime: string;
    endtime: string;
    required: boolean;
    user_id?: string;
}

export interface TimetableSlot {
    dayofweek: string;
    starttime: string;
    endtime: string;
    subject: Subject;
}

export interface TimetableData {
    slots: TimetableSlot[];
  }