import request from "supertest";

export type PostData = {
    caption: string,
    userId: string,
};

export const postData = {
    caption: "hello world!",
    userId: "56789",
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