import { ClassRoom } from "./Class";
import { PaginationProps } from "./Common";

export interface Activity {
  _id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: string;
  content: string;
  images: string[];
  videos: string[];
  activity: Activity;
  classroom?: ClassRoom;
  children?: string[];
  type: string;
  likes: string[];
  loves: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  post: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetActivities extends PaginationProps {
  docs: Activity[];
}

export interface CreatePostPayload {
  content: string;
  image: string;
  video: string;
  activity: string;
  classroom?: string;
  children?: string;
  type: string;
}

export interface GetAllClassPosts extends PaginationProps {
  docs: Post[]
}

export interface GetAllPostComments extends PaginationProps {
  docs: Comment[]
}
