import "dotenv/config";
import request from "supertest";
import { app } from "../server.js";
import initDB from "../db.js";
import postModel from "../model/post.js";
import { postsList } from "./utils.js"

beforeAll(async () => {
  await initDB();
});

beforeEach(async () => {
  await postModel.deleteMany();
});

afterAll((done) => {
  done();
});

describe("Sample Test Suite", () => {
  test("Sample Test Case", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create post", async () => {
    for (const post of postsList) {
      const response = await request(app).post("/post")
        .send(post);
      expect(response.status).toBe(201);
      expect(response.body.caption).toBe(post.caption);
      expect(response.body.userId).toBe(post.userId);
    }
  });

  test("Get All posts", async () => {
    for (const post of postsList) {
      await request(app).post("/post").send(post);
    }

    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get posts by userId", async () => {
    for (const post of postsList) {
      await request(app).post("/post").send(post);
    }

    const response = await request(app).get(
      "/post?userId=" + postsList[0]!.userId
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].caption).toBe(postsList[0]!.caption);
  });

  test("Get post by ID", async () => {
    const postCreationResponse = await request(app).post("/post").send(postsList[0]);
    const { _id } = postCreationResponse.body;

    const response = await request(app).get("/post/" + _id);
    expect(response.status).toBe(200);
    expect(response.body.caption).toBe(postsList[0]!.caption);
    expect(response.body.userId).toBe(postsList[0]!.userId);
    expect(response.body._id).toBe(_id);
  });

  test("Update post", async () => {
    const creation = await request(app).post("/post").send(postsList[0]);
    const createdPostId = creation.body._id;

    const updatedPostData = {
      caption: "Updated Caption",
      userId: postsList[0]!.userId,
    };

    const response = await request(app)
      .put("/post/" + createdPostId)
      .send(updatedPostData);
    expect(response.status).toBe(200);
    expect(response.body.caption).toBe(updatedPostData.caption);
    expect(response.body.userId).toBe(updatedPostData.userId);
    expect(response.body._id).toBe(createdPostId);
  });

  test("Delete post", async () => {
   const creation = await request(app).post("/post").send(postsList[0]);
    const idToDelete = creation.body._id;

    const response = await request(app).delete("/post/" + idToDelete)
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(idToDelete);

    const getResponse = await request(app).get("/post/" + idToDelete);
    expect(getResponse.status).toBe(404);
  });
});
