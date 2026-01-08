import "dotenv/config";
import request from "supertest";
import { app } from "../server.js";
import initDB from "../db.js";
import commentModel from "../model/comment.js";
import { commentsList } from "./utils.js"

beforeAll(async () => {
  await initDB();
});

beforeEach(async () => {
  await commentModel.deleteMany();
});

afterAll((done) => {
  done();
});

describe("Sample Test Suite", () => {
  test("Sample Test Case", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create post", async () => {
    for (const post of commentsList) {
      const response = await request(app).post("/comment")
        .send(post);
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(post.content);
      expect(response.body.userId).toBe(post.userId);
      expect(response.body.postId).toBe(post.postId);
    }
  });

  test("Get All posts", async () => {
    for (const post of commentsList) {
      await request(app).post("/comment").send(post);
    }

    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get posts by userId", async () => {
    for (const post of commentsList) {
      await request(app).post("/comment").send(post);
    }

    const response = await request(app).get(
      "/comment?userId=" + commentsList[0]!.userId
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(commentsList[0]!.content);
    expect(response.body[0].postId).toBe(commentsList[0]!.postId);
  });

  test("Get post by ID", async () => {
    const postCreationResponse = await request(app).post("/comment").send(commentsList[0]);
    const { _id } = postCreationResponse.body;

    const response = await request(app).get("/comment/" + _id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0]!.content);
    expect(response.body.userId).toBe(commentsList[0]!.userId);
    expect(response.body.postId).toBe(commentsList[0]!.postId);
    expect(response.body._id).toBe(_id);
  });

  test("Update post", async () => {
    const creation = await request(app).post("/comment").send(commentsList[0]);
    const createdPostId = creation.body._id;

    const updatedPostData = {
      content: "Updated content",
      userId: commentsList[0]!.userId,
      postId: commentsList[0]!.postId,
    };

    const response = await request(app)
      .put("/comment/" + createdPostId)
      .send(updatedPostData);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedPostData.content);
    expect(response.body.userId).toBe(updatedPostData.userId);
    expect(response.body.postId).toBe(updatedPostData.postId);

    expect(response.body._id).toBe(createdPostId);
  });

  test("Delete post", async () => {
   const creation = await request(app).post("/comment").send(commentsList[0]);
    const idToDelete = creation.body._id;

    const response = await request(app).delete("/comment/" + idToDelete)
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(idToDelete);

    const getResponse = await request(app).get("/comment/" + idToDelete);
    expect(getResponse.status).toBe(404);
  });
});
