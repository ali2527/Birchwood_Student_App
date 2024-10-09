
export interface TimeTableRecord {
  _id: string;
  classroom: string;
  day: string;
  startTime: string;
  endTime: string;
  description: string;
  subject: string;
  meta: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTable {
  [key: string]: TimeTableRecord[];
}

export interface CreateTimeTableRecordPayload {
  classroom: string;
  day: string;
  startTime: string;
  endTime: string;
  description: string;
  subject: string;
  meta: string;
}

export interface CreatTimeTableResonse {
  newTimetable: TimeTableRecord
}