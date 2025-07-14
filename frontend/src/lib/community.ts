import { supabase } from './supabaseClient';

// ---------- POSTS ----------
export async function fetchPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*, comments:comments(id)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createPost({ author_id, author_username, content, tags }: { author_id: string, author_username: string, content: string, tags?: string[] }) {
    const { error } = await supabase
        .from('posts')
        .insert([{ author_id, author_username, content, tags: tags || [] }]);
    if (error) throw error;
}

export async function deletePost(postId: number, userId: string) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', userId);
    if (error) throw error;
}

// ---------- LIKES ----------
export async function fetchUserLikedPostIds(userId: string) {
    const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId);
    if (error) throw error;
    return data ? data.map((l: any) => l.post_id) : [];
}

export async function likePost(postId: number, userId: string) {
    const { error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);
    if (error && !error.message.includes('duplicate key value')) throw error; // 이미 누른 경우 무시
    // posts.likes +1 (서브쿼리, 트리거 추천. 여기선 직접)
    await supabase.rpc('increment_likes', { post_id_param: postId });
}

export async function unlikePost(postId: number, userId: string) {
    const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    if (error) throw error;
    // posts.likes -1
    await supabase.rpc('decrement_likes', { post_id_param: postId });
}

// ---------- COMMENTS ----------
export async function fetchComments(postId: number) {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at');
    if (error) throw error;
    return data;
}

export async function createComment({ post_id, author_id, author_username, content }: { post_id: number, author_id: string, author_username: string, content: string }) {
    const { error } = await supabase
        .from('comments')
        .insert([{ post_id, author_id, author_username, content }]);
    if (error) throw error;
}

export async function deleteComment(commentId: number, userId: string) {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId);
    if (error) throw error;
}
