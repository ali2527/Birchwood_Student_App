import { PaginationProps } from "./Common";

export interface HomeWork {
  _id: string,
  title: string,
  description: string,
  classroom?: string,
  children?: string[],
  assignDate: string,
  dueDate: string,
  status: string,
  assignee: string,
  type: string,
  createdAt: string,
  updatedAt: string,
}

export interface CrateHomeWorkResponse extends PaginationProps {
  homework: HomeWork;
}

export interface CreateHomeWorkPayload {
  title: string;
  description: string;
  classroom?: string;
  children?: string[];
  dueDate: string;
  assignee: "CLASS" | "CHILD";
  type: "HOMEWORK" | "NOTICE" | "WARNING";
}

export interface GetAllHomeWorks extends PaginationProps {
  docs: HomeWork[]
}