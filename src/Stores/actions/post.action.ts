import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import {
  Activity,
  Comment,
  GetActivities,
  GetAllClassPosts,
  GetAllPostComments,
  Post,
} from '../../Types/Post';
import { PaginationProps } from '../../Types/Common';
import { callApi } from '../../Service/api';
import { allApiPaths, ApiPaths } from '../../Service/apiPaths';
import { setLoading } from '../slices/common.slice';
import { removePost, setActivities, setComment, setComments, setLikeDislike, setPost, setPosts } from '../slices/post.slice';
import { asyncShowError, asyncShowSuccess } from './common.action';

type GetActivitiesParams = { page?: number; limit?: number };

export const asyncGetAllActivities = createAsyncThunk(
  'getAllActivities',
  async (params: GetActivitiesParams | undefined, { dispatch }) => {
    dispatch(setLoading(true));

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const path =
      (allApiPaths.getPath('getActivities') as string) +
      `?page=${page}&limit=${limit}`;

    const res = await callApi<GetActivities>({
      path: path as ApiPaths,
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else if (res.data) {
      const raw = res.data as GetActivities | Activity[];
      const payload: GetActivities = Array.isArray(raw)
        ? { docs: raw, ...({} as PaginationProps) }
        : raw;
      if (payload?.docs?.length !== undefined) {
        dispatch(setActivities(payload));
      }
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllPosts = createAsyncThunk(
  'getAllPosts',
  async (params: any, { getState, dispatch }) => {
    const { page, totalPages } = (getState() as RootState).post?.pagination ?? {}

    if (page >= totalPages) {
      return {
        status: true,
        message: 'You\'ve reached the end of the list'
      }
    }

    if (!page) {
      dispatch(setLoading(true));
    }

    let url = allApiPaths.getPath('getAllPosts') + `?limit=${10}&page=${(page ?? 0) + 1}`;

    if (params) {
      if (params.classroom) url += `&classroom=${params.classroom}`;
      if (params.children) url += `&children=${params.children}`;
    }

    const res = await callApi<GetAllClassPosts>({
      path: url as ApiPaths,
    });

    console.log('asyncGetAllPosts response:', JSON.stringify(res, null, 2));

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setPosts(res.data!)
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllClassPosts = createAsyncThunk(
  'getAllClassPosts',
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));

    const classRoomId: string = (getState() as RootState).user.user?.classroom?._id

    const res = await callApi<GetAllClassPosts>({
      path: allApiPaths.getPath('getAllClassPosts', {
        classRoomId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setPosts(res.data!)
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllChildPosts = createAsyncThunk(
  'getAllChildPosts',
  async ({ childId }: { childId: string }, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<GetAllClassPosts>({
      path: allApiPaths.getPath('getAllChildPosts', {
        childId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setPosts({ ...res.data!, replace: true })
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncCreatePost = createAsyncThunk(
  'createPost',
  async (data: FormData, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{ newPost: Post }, FormData>({
      method: "POST",
      path: allApiPaths.getPath('createPost'),
      isFormData: true,
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setPost(res.data?.newPost!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdatePost = createAsyncThunk(
  'createPost',
  async ({ postId, data }: { postId: string, data: FormData }, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<Post, FormData>({
      method: "POST",
      path: allApiPaths.getPath('updatePost', { postId }),
      isFormData: true,
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setPost(res.data!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncDeletePost = createAsyncThunk(
  'deletePost',
  async ({ postId }: { postId: string }, { dispatch }) => {
    dispatch(setLoading(true));
    const res = await callApi({
      path: allApiPaths.getPath('deletePost', {
        postId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(removePost({ _id: postId }))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncLikePost = createAsyncThunk(
  'likePost',
  async ({ postId }: { postId: string }, { getState, dispatch }) => {
    const userId = (getState() as RootState).user.user?._id
    const res = await callApi({
      method: 'POST',
      path: allApiPaths.getPath('likePost', {
        postId
      }),
      body: { authorType: 'parent' },
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else if (userId) {
      dispatch(setLikeDislike({ _id: postId, userId }))
    }
    return res;
  }
);

export const asyncGetCommentsByPostId = createAsyncThunk(
  'getCommentsByPostId',
  async ({ postId }: { postId: string }, { dispatch }) => {
    const res = await callApi<GetAllPostComments>({
      path: allApiPaths.getPath('getAllPostComments', {
        postId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setComments({ postId, ...res.data! })
      );
    }

    return res;
  }
);

export const asyncCreatePostComment = createAsyncThunk(
  'createPostComment',
  async (
    data: { postId: string; comment: { content: string } },
    { dispatch, rejectWithValue },
  ) => {
    const res = await callApi<
      { newComment: Comment },
      { content: string; authorType: string }
    >({
      method: 'POST',
      path: allApiPaths.getPath('createPostComment', {
        postId: data.postId,
      }),
      body: { ...data.comment, authorType: 'parent' },
    });

    if (!res.status || !res.data?.newComment) {
      dispatch(asyncShowError(res.message || 'Could not add comment'));
      return rejectWithValue(res.message || 'Could not add comment');
    }

    dispatch(
      setComment({
        postId: data.postId,
        comment: res.data.newComment,
      }),
    );
    return res;
  },
);
