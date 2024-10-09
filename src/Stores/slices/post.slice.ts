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
    setPosts: (state, { payload }: PayloadAction<GetAllClassPosts>) => {
      const { docs, ...pagination } = payload;

      state.posts = {
        ...state.posts,
        ...docs.reduce((acc, curr) => {
          acc["post_" + curr._id] = curr;
          return acc;
        }, {} as Record<string, Post>)
      }

      state.pagination = pagination;
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
      const postKey = "post_" + postId;

      state.postsComments[postKey].comments = {
        [`comment_${comment._id}`]: comment,
        ...state.postsComments[postKey].comments,
      };
    },
    setLikeDislike: (state, { payload }: PayloadAction<{ _id: string, userId: string }>) => {
      const postKey = "post_" + payload._id;
      const post = state.posts[postKey];

      if (post) {
        const likeIndex = post.likes.indexOf(payload.userId);
        if (likeIndex === -1) {
          // User has not liked the post, so add the userId
          post.likes.push(payload.userId);
        } else {
          // User has already liked the post, so remove the userId
          post.likes.splice(likeIndex, 1);
        }
      }
    },
    setLoveUnlove: (state, { payload }: PayloadAction<{ _id: string, userId: string }>) => {
      const postKey = "post_" + payload._id;
      const post = state.posts[postKey];

      if (post) {
        const likeIndex = post.loves.indexOf(payload.userId);
        if (likeIndex === -1) {
          // User has not liked the post, so add the userId
          post.loves.push(payload.userId);
        } else {
          // User has already liked the post, so remove the userId
          post.loves.splice(likeIndex, 1);
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

export const { setPosts, setPost, removePost, setLikeDislike, setLoveUnlove, setComments, setComment, setActivities, setActivity, removeActivity, resetPostState } =
  PostSlice.actions;

export default PostSlice.reducer;

export const selectPosts = createDraftSafeSelector(
  [(state: RootState) => state.post],
  state => Object.values(state.posts ?? {}) as Post[]
);

export const selectPostById = (postId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.post],
    state => state.posts[`post_${postId}`]
  );

export const selectActivities = createDraftSafeSelector(
  [(state: RootState) => state.post],
  state => Object.values(state.activities ?? {}) as Activity[]
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