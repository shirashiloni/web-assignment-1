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

        it("should update userId", async () => {
            await request(app).post("/auth/register").send(testUser);
            const userBefore = await User.findOne({ email: testUser.email });
            const objectId = userBefore?._id;

            const newUserId = "coolUser123";
            const res = await request(app)
            .put(`/user/${objectId}`)
            .set("Authorization", "Bearer " + token)
            .send({ userId: newUserId });

            expect(res.statusCode).toEqual(200);
            expect(res.body.userId).toBe(newUserId);

            const userAfter = await User.findById(objectId);
            expect(userAfter?.userId).toBe(newUserId);
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
    });
});
