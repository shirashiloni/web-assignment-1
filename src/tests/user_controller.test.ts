import "dotenv/config";
import request from "supertest";
import { app } from "../server";
import mongoose from "mongoose";
import User from "../model/user";

const testUser = {
    email: "test@example.com",
    password: "password123",
    userId: "testuser1"
};

beforeAll(async () => {
    // Use a separate test database or the URI from env
    const url = process.env.MONGO_URI || "mongodb://localhost:27017/test_web_assignment_1";
    await mongoose.connect(url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("User Controller", () => {

    describe("POST /user/register", () => {
        it("should register a new user", async () => {
            const res = await request(app)
                .post("/user/register")
                .send(testUser);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("refreshToken");

            const user = await User.findOne({ email: testUser.email });
            expect(user).toBeTruthy();
            expect(user?.refreshTokens.length).toBe(1);
        });

        it("should fail validation if email is missing", async () => {
            const res = await request(app)
                .post("/user/register")
                .send({ password: "123" });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("POST /user/login", () => {
        it("should login an existing user", async () => {
            await request(app).post("/user/register").send(testUser);

            const res = await request(app)
                .post("/user/login")
                .send(testUser);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("refreshToken");
        });

        it.skip("should prune expired refresh tokens on login", async () => {
            // 1. Register
            await request(app).post("/user/register").send(testUser);
            const user = await User.findOne({ email: testUser.email });

            // 2. Manually add an invalid/expired token to the DB
            const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expiredpayload.signature";
            user?.refreshTokens.push(expiredToken);
            await user?.save();

            // 3. Login again
            const res = await request(app).post("/user/login").send(testUser);
            expect(res.statusCode).toEqual(200);

            const updatedUser = await User.findOne({ email: testUser.email });
            expect(updatedUser?.refreshTokens).not.toContain(expiredToken);
            expect(updatedUser?.refreshTokens).toContain(res.body.refreshToken);
        });
    });

    describe.skip("POST /user/refresh", () => {
        it("should refresh a valid token", async () => {
            const registerRes = await request(app).post("/user/register").send(testUser);
            const refreshToken = registerRes.body.refreshToken;

            const res = await request(app)
                .post("/user/refresh")
                .send({ refreshToken });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("refreshToken");
            const newRefreshToken = res.body.refreshToken;

            // Verify old token is gone and new one is there
            const user = await User.findOne({ email: testUser.email });
            expect(user?.refreshTokens).not.toContain(refreshToken);
            expect(user?.refreshTokens).toContain(newRefreshToken);
        });

        it("should fail with invalid refresh token", async () => {
            const res = await request(app)
                .post("/user/refresh")
                .send({ refreshToken: "invalid.token.here" });
            expect(res.statusCode).toEqual(401); // Or 403 depending on implementation, strictly 401 in our code
        });

        it("should fail if access token is used as refresh token", async () => {
            const registerRes = await request(app).post("/user/register").send(testUser);
            const accessToken = registerRes.body.token;

            // This should fail because signature differs (different secrets)
            const res = await request(app)
                .post("/user/refresh")
                .send({ refreshToken: accessToken });

            expect(res.statusCode).toEqual(401);
        });

        it("should detect token reuse (theft) and clear all tokens", async () => {
            // 1. Register to get a token
            const registerRes = await request(app).post("/user/register").send(testUser);
            const refreshToken = registerRes.body.refreshToken;

            // 2. Refresh it once (this makes the first token invalid on the server side)
            await request(app).post("/user/refresh").send({ refreshToken });

            // 3. Try to use the same OLD refresh token again
            const res = await request(app)
                .post("/user/refresh")
                .send({ refreshToken });

            // Should be 401
            expect(res.statusCode).toEqual(401);

            const user = await User.findOne({ email: testUser.email });
            expect(user?.refreshTokens.length).toBe(0);
        });
    });

    describe("PUT /user/:id", () => {
        it("should update user password", async () => {
            // 1. Register to ensure user exists
            await request(app).post("/user/register").send(testUser);
            // Get user _id
            const userBefore = await User.findOne({ email: testUser.email });
            const userId = userBefore?._id;

            // 2. Update password
            const newPassword = "newpassword123";
            const res = await request(app)
                .put(`/user/${userId}`)
                .send({ password: newPassword });

            expect(res.statusCode).toEqual(200);

            // 3. Verify login with NEW password works
            const loginRes = await request(app).post("/user/login").send({
                email: testUser.email,
                password: newPassword
            });
            expect(loginRes.statusCode).toEqual(200);

            // 4. Verify login with OLD password fails
            const oldLoginRes = await request(app).post("/user/login").send({
                email: testUser.email,
                password: testUser.password
            });
            expect(oldLoginRes.statusCode).toEqual(401);
        });

        it("should update userId", async () => {
            // 1. Register to ensure user exists
            await request(app).post("/user/register").send(testUser);
            const userBefore = await User.findOne({ email: testUser.email });
            const objectId = userBefore?._id;

            const newUserId = "coolUser123";
            const res = await request(app)
                .put(`/user/${objectId}`)
                .send({ userId: newUserId });

            expect(res.statusCode).toEqual(200);
            expect(res.body.userId).toBe(newUserId);

            const userAfter = await User.findById(objectId);
            expect(userAfter?.userId).toBe(newUserId);
        });
    });

    describe("DELETE /user/:id", () => {
        it("should delete user", async () => {
            // 1. Register to ensure user exists
            await request(app).post("/user/register").send(testUser);
            const userBefore = await User.findOne({ email: testUser.email });
            const objectId = userBefore?._id;

            const res = await request(app).delete(`/user/${objectId}`);
            expect(res.statusCode).toEqual(200);

            const userAfter = await User.findById(objectId);
            expect(userAfter).toBeNull();
        });
    });
});
