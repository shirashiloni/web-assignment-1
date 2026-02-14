import request from "supertest";
import { app } from "../server.js";

afterAll((done) => {
    done();
});


describe("File Tests", () => {
    test("upload file", async () => {
        const filePath = `${__dirname}/test_file.txt`;

            const postResponse = await request(app).post("/upload?file=test_file.txt").attach('file', filePath)
            expect(postResponse.statusCode).toEqual(200);

            let url = postResponse.body.url;
            url = url.replace(/^.*\/\/[^/]+/, '')
            
            const getResponse = await request(app).get(url)
            expect(getResponse.statusCode).toEqual(200);
    })
})