import {useQuery} from '@tanstack/react-query';
import {callApi} from '../Service/api';
import {allApiPaths} from '../Service/apiPaths';
import {store} from '../Stores';
import {useAppSelector} from '../Stores/hooks';
import {selectUserToken} from '../Stores/slices/user.slice';
import {asyncShowError} from '../Stores/actions/common.action';
import {queryClient} from './client';

export const postKeys = {
  activities: ['posts', 'activities'],
  child: childId => ['posts', 'feed', 'child', String(childId || '')],
  comments: postId => ['posts', 'comments', String(postId || '')],
};

function docsOf(res) {
  const raw = res?.data;
  if (Array.isArray(raw)) return raw;
  return raw?.docs || [];
}

export function useActivities() {
  const token = useAppSelector(selectUserToken);
  return useQuery({
    queryKey: postKeys.activities,
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await callApi({
        path: `${allApiPaths.getPath('getActivities')}?page=1&limit=100`,
      });
      if (!res?.status) {
        throw new Error(res?.message || 'Could not load activities');
      }
      return docsOf(res);
    },
  });
}

export function useChildPosts(childId) {
  const token = useAppSelector(selectUserToken);
  return useQuery({
    queryKey: postKeys.child(childId),
    enabled: Boolean(token && childId),
    queryFn: async () => {
      const res = await callApi({
        path: `${allApiPaths.getPath('getAllChildPosts', {childId})}?limit=100&page=1`,
      });
      if (!res?.status) {
        throw new Error(res?.message || 'Could not load posts');
      }
      return docsOf(res);
    },
  });
}

export function usePostComments(postId, enabled) {
  const token = useAppSelector(selectUserToken);
  return useQuery({
    queryKey: postKeys.comments(postId),
    enabled: Boolean(token && postId && enabled),
    queryFn: async () => {
      const res = await callApi({
        path: allApiPaths.getPath('getAllPostComments', {postId}),
      });
      if (!res?.status) {
        throw new Error(res?.message || 'Could not load comments');
      }
      return docsOf(res);
    },
  });
}

export function applyPostLike(postId, userId) {
  patchFeedLike(postId, userId);
}

function patchFeedLike(postId, userId) {
  queryClient.setQueriesData({queryKey: ['posts', 'feed']}, current => {
    if (!Array.isArray(current)) return current;
    return current.map(post => {
      if (String(post?._id) !== String(postId)) return post;
      const likes = Array.isArray(post.likes) ? [...post.likes] : [];
      const index = likes.findIndex(id => String(id) === String(userId));
      if (index === -1) likes.push(userId);
      else likes.splice(index, 1);
      return {...post, likes};
    });
  });
}

export async function likePost(postId, authorType) {
  const userId = store.getState()?.user?.user?._id;
  const res = await callApi({
    method: 'POST',
    path: allApiPaths.getPath('likePost', {postId}),
    body: {authorType},
  });
  if (!res?.status) {
    throw new Error(res?.message || 'Could not update the like');
  }
  if (userId) patchFeedLike(postId, userId);
  return res;
}

export async function createPostComment(postId, content, authorType) {
  const res = await callApi({
    method: 'POST',
    path: allApiPaths.getPath('createPostComment', {postId}),
    body: {content, authorType},
  });
  if (!res?.status || !res?.data?.newComment) {
    store.dispatch(asyncShowError(res?.message || 'Could not add comment'));
    throw new Error(res?.message || 'Could not add comment');
  }
  queryClient.setQueryData(postKeys.comments(postId), current => {
    const list = Array.isArray(current) ? current : [];
    if (list.some(item => item?._id === res.data.newComment._id)) return list;
    return [res.data.newComment, ...list];
  });
  queryClient.setQueriesData({queryKey: ['posts', 'feed']}, current => {
    if (!Array.isArray(current)) return current;
    return current.map(post =>
      String(post?._id) === String(postId)
        ? {...post, commentsCount: Number(post.commentsCount || 0) + 1}
        : post,
    );
  });
  return res.data.newComment;
}
