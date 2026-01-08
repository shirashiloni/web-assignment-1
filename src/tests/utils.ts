export type PostData = {
    caption: string,
    userId: string,
};

export type CommentData = {
    content: string,
    userId: string,
    postId: string,
};


export const postsList = [
    {
        caption: "First post",
        userId: "12345",
    },
    {
        caption: "Second post",
        userId: "67890",
    },
    {
        caption: "Third post",
        userId: "54321",
    },
];

export const commentsList: CommentData[] = [
    {
        content: "First post",
        userId: "12345",
        postId: "post1",
    },
    {
        content: "Second post",
        userId: "67890",
        postId: "post2",
    },
];