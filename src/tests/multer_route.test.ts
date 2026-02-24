import request from "supertest";
import { app } from "../server.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

afterAll((done) => {
  done();
});

describe("File Tests", () => {
  test("upload file", async () => {
    const filePath = join(__dirname, "test_file.txt");

    const postResponse = await request(app)
      .post("/upload?file=test_file.txt")
      .attach("file", filePath);
    expect(postResponse.statusCode).toEqual(200);

    let url = postResponse.body.url;
    url = url.replace(/^.*\/\/[^/]+/, "");

    const getResponse = await request(app).get(url);
    expect(getResponse.statusCode).toEqual(200);
  });
});
