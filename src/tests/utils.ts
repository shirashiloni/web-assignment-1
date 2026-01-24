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
        userId: "000000000000000000012345",
    },
    {
        caption: "Second post",
        userId: "000000000000000000067890",
    },
    {
        caption: "Third post",
        userId: "000000000000000000054321",
    },
];

export const commentsList: CommentData[] = [
    {
        content: "First post",
        userId: "000000000000000000012345",
        postId: "000000000000000000000001",
    },
    {
        content: "Second post",
        userId: "000000000000000000067890",
        postId: "000000000000000000000002",
    },
];