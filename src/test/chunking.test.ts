import { describe, expect, test } from "bun:test";
import { AnnotatedText } from "../annotated";

describe("AnnotatedText chunking", () => {
  test("character-based chunking when no boundaries", () => {
    const at = new AnnotatedText();
    at.pushText("Hello ");
    at.pushText("world");
    // annotations: [{text: "Hello "}, {text: "world"}]
    // lengths: [6, 5]

    const chunks = at.split(8);
    // Chunk 1 should be "Hello " (length 6)
    // Chunk 2 should be "world" (length 5)
    expect(chunks.length).toBe(2);
    expect(chunks[0].length()).toBe(6);
    expect(chunks[1].length()).toBe(5);
  });

  test("paragraph-based chunking", () => {
    const at = new AnnotatedText();
    at.pushText("Para 1");
    at.pushMarkup("", "\n\n");
    at.pushText("Para 2");
    at.pushMarkup("", "\n\n");
    at.pushText("Para 3");
    // lengths: [6, 2, 6, 2, 6] = 22

    // maxSize = 10.
    // P1 is 8 chars. P2 is 8 chars. P3 is 6 chars.
    // Chunk 1 should be P1 (8 chars).
    // Chunk 2 should be P2 (8 chars).
    // Chunk 3 should be P3 (6 chars).
    const chunks = at.split(10);
    console.log(
      "Chunk lengths:",
      chunks.map(c => c.length()),
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0].length()).toBe(8);
    expect(chunks[1].length()).toBe(8);
    expect(chunks[2].length()).toBe(6);
  });

  test("single paragraph larger than maxSize", () => {
    const at = new AnnotatedText();
    at.pushText("Very long paragraph");
    at.pushMarkup("", "\n\n");
    // lengths: [19, 2] = 21

    // maxSize = 10.
    // P1 is 21.
    // Chunk 1: "Very long " (10).
    // Chunk 2: "paragraph" (9).
    // Chunk 3: "\n\n" (2).
    const chunks = at.split(10);
    console.log(
      "Chunk lengths:",
      chunks.map(c => c.length()),
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0].length()).toBe(10);
    expect(chunks[1].length()).toBe(9);
    expect(chunks[2].length()).toBe(2);
  });

  test("multiple paragraphs, some don't fit", () => {
    const at = new AnnotatedText();
    at.pushText("P1");
    at.pushMarkup("", "\n\n");
    at.pushText("P2");
    at.pushMarkup("", "\n\n");
    at.pushText("P3");
    at.pushMarkup("", "\n\n");
    at.pushText("P4");
    // lengths: [2, 2, 2, 2, 2, 2, 2] = 14

    // maxSize = 5.
    // P1+P1_end = 4. Fits.
    // P2+P2_end = 4. Fits.
    // P3+P3_end = 4. Fits.
    // P4 = 2. Fits.
    // Total chunks: 4.
    const chunks = at.split(5);
    expect(chunks.length).toBe(4);
    expect(chunks[0].length()).toBe(4);
    expect(chunks[1].length()).toBe(4);
    expect(chunks[2].length()).toBe(4);
    expect(chunks[3].length()).toBe(2);
  });
});
