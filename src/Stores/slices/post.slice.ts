import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice
} from '@reduxjs/toolkit';
import { RootState } from '..';
import { PaginationProps } from '../../Types/Common';
import { Activity, Comment, GetActivities, GetAllClassPosts, Post } from '../../Types/Post';

interface PostSliceState {
  activities: Record<string, Activity>;
  posts: Record<string, Post>;
  postsComments: Record<string, {
    comments: Record<string, Comment>,
    commentsPagination: any
  }>;
  pagination: PaginationProps,
}

const initialState: PostSliceState = {
  activities: {},
  posts: {},
  postsComments: {},
  pagination: {} as PaginationProps,
};

const PostSlice = createSlice({
  name: 'Post',
  initialState,
  reducers: {
    setPosts: (
      state,
      { payload }: PayloadAction<GetAllClassPosts & { replace?: boolean }>,
    ) => {
      const { docs, replace, ...pagination } = payload;
      const mapped = (docs || []).reduce((acc, curr) => {
        acc['post_' + curr._id] = curr;
        return acc;
      }, {} as Record<string, Post>);

      state.posts = replace ? mapped : { ...state.posts, ...mapped };
      state.pagination = pagination as PaginationProps;
    },
    setPost: (state, { payload }: PayloadAction<Partial<Post>>) => {
      state.posts = {
        ["post_" + payload._id]: { ...state.posts["post_" + payload._id], ...payload },
        ...state.posts
      }
    },
    removePost: (state, { payload }: PayloadAction<{ _id: string }>) => {
      delete state.posts["post_" + payload._id];
    },
    setComments: (state, { payload }: PayloadAction<{ docs: Comment[] } & { postId: string }>) => {
      const { docs, postId } = payload;
      state.postsComments["post_" + postId] = state.postsComments["post_" + postId] || { comments: {}, commentPagination: {} };
      docs.forEach((comment) => {
        state.postsComments["post_" + postId].comments[`comment_${comment._id}`] = comment;
      });
    },
    setComment: (state, { payload }: PayloadAction<{ postId: string, comment: Comment }>) => {

      const { postId, comment } = payload;
      if (!comment?._id || !postId) {
        return;
      }
      const postKey = "post_" + postId;

      if (!state.postsComments[postKey]) {
        state.postsComments[postKey] = { comments: {}, commentPagination: {} };
      }

      state.postsComments[postKey].comments = {
        [`comment_${comment._id}`]: comment,
        ...state.postsComments[postKey].comments,
      };
    },
    setLikeDislike: (state, { payload }: PayloadAction<{ _id: string, userId: string }>) => {
      const postKey = "post_" + payload._id;
      const post = state.posts[postKey];

      if (post && payload.userId) {
        if (!Array.isArray(post.likes)) {
          post.likes = [];
        }
        const likeIndex = post.likes.findIndex(
          (id: string) => String(id) === String(payload.userId),
        );
        if (likeIndex === -1) {
          post.likes.push(payload.userId);
        } else {
          post.likes.splice(likeIndex, 1);
        }
      }
    },
    setActivities: (state, { payload }: PayloadAction<GetActivities>) => {
      const { docs, ...pagination } = payload;
      state.activities = docs.reduce((acc, curr) => {
        acc["activity_" + curr._id] = curr;
        return acc;
      }, {} as Record<string, Activity>);
      state.pagination = pagination;
    },
    setActivity: (state, { payload }: PayloadAction<Partial<Activity>>) => {
      state.activities["activity_" + payload._id] = { ...state.activities["activity_" + payload._id], ...payload };
    },
    removeActivity: (state, { payload }: PayloadAction<Partial<Activity>>) => {
      delete state.activities["activity_" + payload._id]
    },
    resetPostState: _ => initialState,
  },
});

export const { setPosts, setPost, removePost, setLikeDislike, setComments, setComment, setActivities, setActivity, removeActivity, resetPostState } =
  PostSlice.actions;

export default PostSlice.reducer;

export const selectPosts = createDraftSafeSelector(
  [(state: RootState) => state.post.posts],
  posts => Object.values(posts ?? {}) as Post[]
);

export const selectPostById = (postId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.post.posts],
    posts => posts[`post_${postId}`]
  );

export const selectActivities = createDraftSafeSelector(
  [(state: RootState) => state.post.activities],
  activities => Object.values(activities ?? {}) as Activity[]
);

// export const selectChildById = (childId: string) =>
//   createDraftSafeSelector(
//     [(state: RootState) => state.class.children],
//     children => children["child_" + childId] as Child
//   );

export const selectPostComments = (postId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.post.postsComments],
    postsComments => Object.values(postsComments?.["post_" + postId]?.comments || {})
  );