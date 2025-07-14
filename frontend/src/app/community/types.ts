export interface Post {
    id: number
    author_id: string
    author_username: string
    content: string
    tags: string[]
    likes: number
    created_at: string
  }
  
  export interface Comment {
    id: number
    post_id: number
    author_id: string
    author_username: string
    content: string
    created_at: string
  } 