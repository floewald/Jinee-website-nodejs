import assert from "node:assert/strict";
import test from "node:test";
import { getVideoId, parsePublishDate, validateTranscript } from "../download-video-transcripts.mjs";

test("only accepts real YouTube embed IDs, never external hosts or paths", () => {
  assert.equal(getVideoId("https://www.youtube.com/embed/x7U6OarM2vk"), "x7U6OarM2vk");
  assert.equal(getVideoId("https://www.youtube-nocookie.com/embed/x7U6OarM2vk?rel=0"), "x7U6OarM2vk");
  assert.equal(getVideoId("https://example.com/embed/x7U6OarM2vk"), null);
  assert.equal(getVideoId("https://www.youtube.com/embed/../../other"), null);
  assert.equal(getVideoId(undefined), null);
});

test("extracts a source timestamp without inventing a date or time", () => {
  assert.equal(parsePublishDate('{"publishDate":"2023-07-28T06:00:22-07:00"}'), "2023-07-28T06:00:22-07:00");
  assert.equal(parsePublishDate('{"publishDate":"2023-07-28"}'), null);
  assert.equal(parsePublishDate('{"publishDate":"2023-02-31T06:00:22-07:00"}'), null);
  assert.equal(parsePublishDate("consent page"), null);
});

test("rejects empty, corrupt, mismatched, or unsafe cached transcripts", () => {
  const valid = { video_id: "x7U6OarM2vk", segment_count: 1, segments: [{ start: 0, duration: 1, text: "Hello" }] };
  assert.equal(validateTranscript(valid, "x7U6OarM2vk"), true);
  assert.equal(validateTranscript(valid, "b7YuRUi9B4s"), false);
  assert.equal(validateTranscript({ ...valid, segment_count: 0, segments: [] }, "x7U6OarM2vk"), false);
  assert.equal(validateTranscript({ ...valid, segments: [{ start: -1, duration: 1, text: "Hello" }] }, "x7U6OarM2vk"), false);
  assert.equal(validateTranscript({ ...valid, segments: [{ start: 0, duration: 1, text: " " }] }, "x7U6OarM2vk"), false);
  assert.equal(validateTranscript({ ...valid, segments: [null] }, "x7U6OarM2vk"), false);
});
