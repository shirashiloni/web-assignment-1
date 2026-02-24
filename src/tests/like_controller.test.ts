import "dotenv/config";
import likeModel from "../model/like.js";
import postModel from "../model/post.js";
import userModel from "../model/user.js";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../services/ai_keywords.js", () => ({
  extractKeywordsFromQuery: jest.fn<() => Promise<string[]>>().mockResolvedValue(["test"]),
  generateTagsForPost: jest.fn<() => Promise<string[]>>().mockResolvedValue(["test"]),
}));

const { app } = await import("../server.js");

let token: string;
let postId: string;

const testUser = {
  email: "liketester@example.com",
  password: "password123",
  userId: "liketester1",
  name: "Like Tester",
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
  await likeModel.deleteMany({});
  await postModel.deleteMany({});

  // Create a fresh post for each test
  const postRes = await request(app)
    .post("/post")
    .set("Authorization", "Bearer " + token)
    .send({ caption: "Like test post", userId: testUser.userId });
  postId = postRes.body._id;
});

afterAll(async () => {
  await likeModel.deleteMany({});
  await postModel.deleteMany({});
  await userModel.deleteMany({});
  await mongoose.connection.close();
});

describe("Like Controller Tests", () => {
  describe("GET /like/status", () => {
    test("returns liked: false when post has not been liked", async () => {
      const response = await request(app)
        .get(`/like/status?postId=${postId}&userId=${testUser.userId}`);
      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(false);
    });

    test("returns liked: true after liking a post", async () => {
      await request(app)
        .post("/post/" + postId + "/like")
        .set("Authorization", "Bearer " + token)
        .send({ userId: testUser.userId });

      const response = await request(app)
        .get(`/like/status?postId=${postId}&userId=${testUser.userId}`);
      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(true);
    });

    test("returns liked: false after liking then unliking a post", async () => {
      await request(app)
        .post("/post/" + postId + "/like")
        .set("Authorization", "Bearer " + token)
        .send({ userId: testUser.userId });

      await request(app)
        .post("/post/" + postId + "/unlike")
        .set("Authorization", "Bearer " + token)
        .send({ userId: testUser.userId });

      const response = await request(app)
        .get(`/like/status?postId=${postId}&userId=${testUser.userId}`);
      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(false);
    });

    test("returns 400 when postId is missing", async () => {
      const response = await request(app)
        .get(`/like/status?userId=${testUser.userId}`);
      expect(response.status).toBe(400);
    });

    test("returns 400 when userId is missing", async () => {
      const response = await request(app)
        .get(`/like/status?postId=${postId}`);
      expect(response.status).toBe(400);
    });

    test("returns liked: false for a user who never liked the post", async () => {
      await request(app)
        .post("/post/" + postId + "/like")
        .set("Authorization", "Bearer " + token)
        .send({ userId: testUser.userId });

      const response = await request(app)
        .get(`/like/status?postId=${postId}&userId=someOtherUser`);
      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(false);
    });
  });

  describe("POST /post/:id/like and /post/:id/unlike", () => {
    test("multiple users can like the same post independently", async () => {
      await request(app)
        .post("/post/" + postId + "/like")
        .set("Authorization", "Bearer " + token)
        .send({ userId: "user1" });

      const res = await request(app)
        .post("/post/" + postId + "/like")
        .set("Authorization", "Bearer " + token)
        .send({ userId: "user2" });

      expect(res.status).toBe(200);
      expect(res.body.likeCount).toBe(2);
    });

    test("unlike a post that was never liked does not decrement below 0", async () => {
      const res = await request(app)
        .post("/post/" + postId + "/unlike")
        .set("Authorization", "Bearer " + token)
        .send({ userId: testUser.userId });
      expect(res.status).toBe(200);
      expect(res.body.likeCount).toBe(0);
    });
  });
});
