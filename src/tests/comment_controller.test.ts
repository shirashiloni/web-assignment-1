import "dotenv/config";
import request from "supertest";
import { app } from "../server.js";
import initDB from "../db.js";
import commentModel from "../model/comment.js";
import userModel from "../model/user.js";
import { commentsList } from "./utils.js"


const testUser = {
  email: "commenttester@example.com",
  password: "password123",
  userId: "commenttester1"
};

beforeAll(async () => {
  await initDB();
  await userModel.deleteMany({});

  // Register user for testing ownership if needed, but no token login
  await request(app).post("/user/register").send(testUser);
});

beforeEach(async () => {
  await commentModel.deleteMany();
});

afterAll((done) => {
  done();
});

describe("Comment Controller Tests", () => {
  test("Sample Test Case", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app).post("/comment")
        .send(comment);
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.userId).toBe(comment.userId);
      expect(response.body.postId).toBe(comment.postId);
    }
  });

  test("Get All comments", async () => {
    for (const comment of commentsList) {
      await request(app).post("/comment")
        .send(comment);
    }

    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get comments by userId", async () => {
    for (const comment of commentsList) {
      await request(app).post("/comment")
        .send(comment);
    }

    const response = await request(app).get(
      "/comment?userId=" + commentsList[0]!.userId
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(commentsList[0]!.content);
    expect(response.body[0].postId).toBe(commentsList[0]!.postId);
  });

  test("Get comment by ID", async () => {
    const creation = await request(app).post("/comment")
      .send(commentsList[0]);
    const { _id } = creation.body;

    const response = await request(app).get("/comment/" + _id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0]!.content);
    expect(response.body.userId).toBe(commentsList[0]!.userId);
    expect(response.body.postId).toBe(commentsList[0]!.postId);
    expect(response.body._id).toBe(_id);
  });

  test("Update comment", async () => {
    const creation = await request(app).post("/comment")
      .send(commentsList[0]);
    const createdId = creation.body._id;

    const updatedData = {
      content: "Updated content",
      userId: commentsList[0]!.userId,
      postId: commentsList[0]!.postId,
    };

    const response = await request(app)
      .put("/comment/" + createdId)
      .send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedData.content);
    expect(response.body.userId).toBe(updatedData.userId);
    expect(response.body.postId).toBe(updatedData.postId);

    expect(response.body._id).toBe(createdId);
  });

  test("Delete comment", async () => {
    const creation = await request(app).post("/comment")
      .send(commentsList[0]);
    const idToDelete = creation.body._id;

    const response = await request(app).delete("/comment/" + idToDelete);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(idToDelete);

    const getResponse = await request(app).get("/comment/" + idToDelete);
    expect(getResponse.status).toBe(404);
  });
});
