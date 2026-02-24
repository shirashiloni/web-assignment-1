import "dotenv/config";
import request from "supertest";
import { app } from "../server";
import mongoose from "mongoose";
import User from "../model/user";

const testUser = {
    email: "test@example.com",
    password: "password123",
    userId: "uniqueTestUser1",
    name: "Test User",
};

let token: string;

beforeAll(async () => {
    const dbName = `test_db_${process.env.JEST_WORKER_ID || Date.now()}`;
    await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);

      // Register and login to get token
    await request(app).post("/auth/register").send(testUser);
    const res = await request(app).post("/auth/login").send(testUser);
    token = res.body.token;
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("User Controller", () => {
    describe("PUT /user/:id", () => {
        it("should update user password", async () => {
            await request(app).post("/auth/register").send(testUser);
            const userBefore = await User.findOne({ email: testUser.email });
            const userId = userBefore?._id;

            const newPassword = "newpassword123";
            const res = await request(app)
            .put(`/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send({ password: newPassword });

            expect(res.statusCode).toEqual(200);

            const loginRes = await request(app).post("/auth/login").send({
                email: testUser.email,
                password: newPassword
            });
            expect(loginRes.statusCode).toEqual(200);

            const oldLoginRes = await request(app).post("/auth/login").send({
                email: testUser.email,
                password: testUser.password
            });
            expect(oldLoginRes.statusCode).toEqual(401);
        });
    });

    describe("DELETE /user/:id", () => {
        it("should delete user", async () => {
            await request(app).post("/auth/register").send(testUser);
            const userBefore = await User.findOne({ email: testUser.email });
            const objectId = userBefore?._id;

            const res = await request(app)
            .delete(`/user/${objectId}`)
            .set("Authorization", "Bearer " + token)
            expect(res.statusCode).toEqual(200);

            const userAfter = await User.findById(objectId);
            expect(userAfter).toBeNull();
        });

        it("should return 404 when deleting non-existent user", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/user/${nonExistentId}`)
                .set("Authorization", "Bearer " + token);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe("GET /user/me", () => {
        it("should return the currently authenticated user", async () => {
            await request(app).post("/auth/register").send(testUser);
            const loginRes = await request(app).post("/auth/login").send(testUser);
            const freshToken = loginRes.body.token;

            const res = await request(app)
                .get("/user/me")
                .set("Authorization", "Bearer " + freshToken);
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.name).toBe(testUser.name);
            expect(res.body).not.toHaveProperty("password");
            expect(res.body).not.toHaveProperty("refreshTokens");
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app).get("/user/me");
            expect(res.statusCode).toEqual(401);
        });
    });

    describe("GET /user/:id", () => {
        it("should return user by ID", async () => {
            await request(app).post("/auth/register").send(testUser);
            const user = await User.findOne({ email: testUser.email });
            const userId = user?._id;

            const res = await request(app)
                .get(`/user/${userId}`)
                .set("Authorization", "Bearer " + token);
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.name).toBe(testUser.name);
            expect(res.body).not.toHaveProperty("password");
        });

        it("should return 404 for non-existent user", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/user/${nonExistentId}`)
                .set("Authorization", "Bearer " + token);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe("PUT /user/:id - edge cases", () => {
        it("should return 404 when updating non-existent user", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/user/${nonExistentId}`)
                .set("Authorization", "Bearer " + token)
                .send({ name: "New Name" });
            expect(res.statusCode).toEqual(404);
        });

        it("should update user name", async () => {
            await request(app).post("/auth/register").send(testUser);
            const user = await User.findOne({ email: testUser.email });
            const userId = user?._id;

            const res = await request(app)
                .put(`/user/${userId}`)
                .set("Authorization", "Bearer " + token)
                .send({ name: "Updated Name" });
            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toBe("Updated Name");
        });
    });
});
