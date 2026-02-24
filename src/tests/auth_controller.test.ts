import "dotenv/config";
import request from "supertest";
import { app } from "../server";
import mongoose from "mongoose";
import User from "../model/user";

const testUser = {
    email: "test@example.com",
    password: "password123",
    userId: "testuser1",
    name: "Test User",
};

beforeAll(async () => {
    const dbName = `test_db_${process.env.JEST_WORKER_ID || Date.now()}`;
    await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});


beforeEach(async () => {
    await User.deleteMany({});
});

describe("Auth Controller", () => {
    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            const res = await request(app)
                .post("/auth/register")
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
                .post("/auth/register")
                .send({ password: "123" });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("POST /auth/login", () => {
        it("should login an existing user", async () => {
            await request(app).post("/auth/register").send(testUser);

            const res = await request(app)
                .post("/auth/login")
                .send(testUser);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("refreshToken");
        });
    });

    describe("POST /auth/refresh", () => {
        it("should refresh a valid token", async () => {
            const registerRes = await request(app).post("/auth/register").send(testUser);
            const refreshToken = registerRes.body.refreshToken;

            const res = await request(app)
                .post("/auth/refresh")
                .send({ refreshToken });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("refreshToken");
            const newRefreshToken = res.body.refreshToken;

            const user = await User.findOne({ email: testUser.email });
            expect(user?.refreshTokens).toStrictEqual([newRefreshToken]);
        });

        it("should fail with invalid refresh token", async () => {
            const res = await request(app)
                .post("/auth/refresh")
                .send({ refreshToken: "invalid.token.here" });
            expect(res.statusCode).toEqual(401); 
        });

        it("should fail if access token is used as refresh token", async () => {
            const registerRes = await request(app).post("/auth/register").send(testUser);
            const accessToken = registerRes.body.token;

            const res = await request(app)
                .post("/auth/refresh")
                .send({ refreshToken: accessToken });

            expect(res.statusCode).toEqual(401);
        });

        it("should fail when refresh token body is missing", async () => {
            const res = await request(app)
                .post("/auth/refresh")
                .send({});
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("POST /auth/login - failures", () => {
        it("should fail with wrong password", async () => {
            await request(app).post("/auth/register").send(testUser);
            const res = await request(app)
                .post("/auth/login")
                .send({ email: testUser.email, password: "wrongpassword" });
            expect(res.statusCode).toEqual(401);
        });

        it("should fail when user does not exist", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ email: "nonexistent@example.com", password: "password" });
            expect(res.statusCode).toEqual(401);
        });

        it("should fail with missing email", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ password: "password123" });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("POST /auth/register - failures", () => {
        it("should fail with duplicate email", async () => {
            await request(app).post("/auth/register").send(testUser);
            const res = await request(app)
                .post("/auth/register")
                .send(testUser);
            expect(res.statusCode).toEqual(500);
        });

        it("should fail with missing name", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({ email: "new@example.com", password: "pass123", userId: "newuser1" });
            expect(res.statusCode).toEqual(400);
        });

        it("should fail with missing userId", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({ email: "new2@example.com", password: "pass123", name: "Test" });
            expect(res.statusCode).toEqual(400);
        });
    });
});
