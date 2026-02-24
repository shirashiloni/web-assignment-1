import "dotenv/config";
import request from "supertest";
import postModel from "../model/post.js";
import likeModel from "../model/like.js";
import { postsList } from "./utils.js";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

// Must use unstable_mockModule + dynamic import for ESM mocking to work correctly.
// The mock must be registered BEFORE importing any module that transitively
// imports ai_keywords (server -> post router -> PostController -> ai_keywords).
jest.unstable_mockModule("../services/ai_keywords.js", () => ({
  extractKeywordsFromQuery: jest.fn<() => Promise<string[]>>().mockResolvedValue(["food", "italian", "cooking", "pasta"]),
  generateTagsForPost: jest.fn<() => Promise<string[]>>().mockResolvedValue(["fun", "ice creame", "pizza", "pasta"]),
}));

const { app } = await import("../server.js");

let token: string;

const testUser = {
  email: "posttester@example.com",
  password: "password123",
  userId: "uniquePostTester1",
  name: "Test User",
};

beforeAll(async () => {
  const dbName = `test_db_${process.env.JEST_WORKER_ID || Date.now()}`;
  await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);

  // Register and login to get token
  await request(app).post("/auth/register").send({
    userId: "uniquePostTester1", // Ensure userId is unique
    name: testUser.name,
    email: testUser.email,
    password: testUser.password,
  });
  const res = await request(app).post("/auth/login").send(testUser);
  token = res.body.token;
});

beforeEach(async () => {
  await postModel.deleteMany();
  await likeModel.deleteMany();
});

afterAll(async () => {
  await postModel.deleteMany({});
  await likeModel.deleteMany({});
  await mongoose.connection.close();
  jest.clearAllMocks();
});

describe("Post Controller Tests", () => {
  test("Sample Test Case", async () => {
    const response = await request(app)
      .get("/post")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test("Create post", async () => {
    for (const post of postsList) {
      const response = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + token)
        .send(post);
      expect(response.status).toBe(201);
      expect(response.body.caption).toBe(post.caption);
      expect(response.body.userId).toBe(post.userId);
    }
  });

  test("Get All posts", async () => {
    for (const post of postsList) {
      await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + token)
        .send(post);
    }

    const response = await request(app)
      .get("/post")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(postsList.length);
  });

  test("Get posts by userId", async () => {
    for (const post of postsList) {
      await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + token)
        .send(post);
    }

    const response = await request(app)
      .get("/post/user/" + postsList[0]!.userId)
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].caption).toBe(postsList[0]!.caption);
  });

  test("Get post by ID", async () => {
    const postCreationResponse = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const { _id } = postCreationResponse.body;

    const response = await request(app)
      .get("/post/" + _id)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body.caption).toBe(postsList[0]!.caption);
    expect(response.body.userId).toBe(postsList[0]!.userId);
    expect(response.body._id).toBe(_id);
  });

  test("Update post", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const createdPostId = creation.body._id;

    const updatedPostData = {
      caption: "Updated Caption",
      userId: postsList[0]!.userId,
      imageUrl: "https://example.com/updatedimage.jpg",
    };

    const response = await request(app)
      .put("/post/" + createdPostId)
      .set("Authorization", "Bearer " + token)
      .send(updatedPostData);
    expect(response.status).toBe(200);
    expect(response.body.caption).toBe(updatedPostData.caption);
    expect(response.body.userId).toBe(updatedPostData.userId);
    expect(response.body.imageUrl).toBe(updatedPostData.imageUrl);
  });

  test("Delete post", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const idToDelete = creation.body._id;

    const response = await request(app)
      .delete("/post/" + idToDelete)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(idToDelete);

    const getResponse = await request(app)
      .get("/post/" + idToDelete)
      .set("Authorization", "Bearer " + token);
    expect(getResponse.status).toBe(404);
  });

  test("Get post by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get("/post/" + nonExistentId)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(404);
  });

  test("Delete post by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete("/post/" + nonExistentId)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(404);
  });

  test("Update post by non-existent ID returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updatedPostData = {
      caption: "Updated Caption",
      userId: testUser.userId,
      imageUrl: "https://example.com/updatedimage.jpg",
    };
    const response = await request(app)
      .put("/post/" + nonExistentId)
      .set("Authorization", "Bearer " + token)
      .send(updatedPostData);
    expect(response.status).toBe(404);
  });

  test("/post/search returns posts by AI tags", async () => {
    const posts = [
      {
        caption: "Delicious pasta with tomato sauce",
        userId: testUser.userId,
        createDate: new Date(),
        imageUrl: "https://example.com/pasta.jpg",
      },
      {
        caption: "Running in the park",
        userId: testUser.userId,
        createDate: new Date(),
        imageUrl: "https://example.com/running.jpg",
      },
      {
        caption: "Best Italian pizza recipe",
        userId: testUser.userId,
        createDate: new Date(),
        imageUrl: "https://example.com/pizza.jpg",
      },
    ];

    for (const post of posts) {
      await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + token)
        .send(post);
    }

    const response = await request(app)
      .get("/post/search?q=yummy+pasta")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const found = response.body.data.some((p: any) =>
      p.caption.includes("pasta"),
    );
    expect(found).toBe(true);
    expect(Array.isArray(response.body.tags)).toBe(true);
    expect(response.body.tags).toContain("pasta");
  });

  test("Like post increments likeCount", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const postId = creation.body._id;

    const res = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });
    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(1);
  });

  test("Liking the same post twice does not double-count", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const postId = creation.body._id;

    await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });

    const res = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });
    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(1);
  });

  test("Unlike post decrements likeCount", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const postId = creation.body._id;

    await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });

    const res = await request(app)
      .post("/post/" + postId + "/unlike")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });
    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(0);
  });

  test("Like post with missing userId returns 400", async () => {
    const creation = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + token)
      .send(postsList[0]);
    const postId = creation.body._id;

    const res = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({});
    expect(res.status).toBe(400);
  });

  test("Like non-existent post returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/post/" + nonExistentId + "/like")
      .set("Authorization", "Bearer " + token)
      .send({ userId: testUser.userId });
    expect(res.status).toBe(404);
  });

  test("POST /post/search returns 400 when query is missing", async () => {
    const response = await request(app)
      .get("/post/search")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(400);
  });
});
