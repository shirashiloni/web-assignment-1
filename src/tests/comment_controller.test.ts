import "dotenv/config";
import request from "supertest";
import { app } from "../server.js";
import commentModel from "../model/comment.js";
import userModel from "../model/user.js";
import { commentsList } from "./utils.js"
import mongoose from "mongoose";

let token: string;

const testUser = {
  email: "commenttester@example.com",
  password: "password123",
  userId: "commenttester1",
  name: "Test User",
};

beforeAll(async () => {
  const dbName = `test_db_${process.env.JEST_WORKER_ID || Date.now()}`;
  await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);

  await userModel.deleteMany({});

  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  token = res.body.token;
});

beforeEach(async () => {
  await commentModel.deleteMany();
});

afterAll(async () => {
  await commentModel.deleteMany({});
  await mongoose.connection.close();
});

describe("Comment Controller Tests", () => {
  test("Sample Test Case", async () => {
    const response = await request(app).get("/comment").set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test("Create comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app).post("/comment")
        .set("Authorization", "Bearer " + token)
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
        .set("Authorization", "Bearer " + token)
        .send(comment);
    }

    const response = await request(app).get("/comment").set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(commentsList.length);
  });

  test("Get comments by userId", async () => {
    for (const comment of commentsList) {
      await request(app).post("/comment")
        .set("Authorization", "Bearer " + token)
        .send(comment);
    }

    const response = await request(app).get(
      "/comment?userId=" + commentsList[0]!.userId
    ).set("Authorization", "Bearer " + token);

    const data = response.body.data;
    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].content).toBe(commentsList[0]!.content);
    expect(data[0].postId).toBe(commentsList[0]!.postId);
  });

  test("Get comment by ID", async () => {
    const creation = await request(app).post("/comment")
      .set("Authorization", "Bearer " + token)
      .send(commentsList[0]);
    const { _id } = creation.body;

    const response = await request(app).get("/comment/" + _id).set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0]!.content);
    expect(response.body.userId).toBe(commentsList[0]!.userId);
    expect(response.body.postId).toBe(commentsList[0]!.postId);
    expect(response.body._id).toBe(_id);
  });

  test("Update comment", async () => {
    const creation = await request(app).post("/comment")
      .set("Authorization", "Bearer " + token)
      .send(commentsList[0]);
    const createdId = creation.body._id;

    const updatedData = {
      content: "Updated content",
      userId: commentsList[0]!.userId,
      postId: commentsList[0]!.postId,
    };

    const response = await request(app)
      .put("/comment/" + createdId)
      .set("Authorization", "Bearer " + token)
      .send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedData.content);
    expect(response.body.userId).toBe(updatedData.userId);
    expect(response.body.postId).toBe(updatedData.postId);

    expect(response.body._id).toBe(createdId);
  });

  test("Delete comment", async () => {
    const creation = await request(app).post("/comment")
      .set("Authorization", "Bearer " + token)
      .send(commentsList[0]);
    const idToDelete = creation.body._id;

    const response = await request(app).delete("/comment/" + idToDelete).set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(idToDelete);

    const getResponse = await request(app).get("/comment/" + idToDelete).set("Authorization", "Bearer " + token);
    expect(getResponse.status).toBe(404);
  });

  test("Delete comment by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete("/comment/" + nonExistentId)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(404);
  });

  test("Update comment by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updatedData = {
      content: "Updated content",
      userId: commentsList[0]!.userId,
      postId: commentsList[0]!.postId,
    };
    const response = await request(app)
      .put("/comment/" + nonExistentId)
      .set("Authorization", "Bearer " + token)
      .send(updatedData);
    expect(response.status).toBe(404);
  });

  test("User cannot update a comment they did not create", async () => {
    const creation = await request(app).post("/comment")
      .set("Authorization", "Bearer " + token)
      .send({ ...commentsList[0], userId: "otherId" });
    const createdCommentId = creation.body._id;

    const updatedData = {
      content: "Malicious Update",
      userId: testUser.userId,
      postId: commentsList[0]!.postId,
    };
    const response = await request(app)
      .put("/comment/" + createdCommentId)
      .set("Authorization", "Bearer " + token)
      .send(updatedData);
    expect(response.status).toBe(403);
  });

  test("Get comment by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get("/comment/" + nonExistentId)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(404);
  });

  test("Get comments filtered by postId", async () => {
    for (const comment of commentsList) {
      await request(app).post("/comment")
        .set("Authorization", "Bearer " + token)
        .send(comment);
    }

    const response = await request(app)
      .get("/comment?postId=" + commentsList[0]!.postId)
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    const data = response.body.data;
    expect(data.length).toBeGreaterThan(0);
    data.forEach((c: any) => expect(c.postId).toBe(commentsList[0]!.postId));
  });
});
