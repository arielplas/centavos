import { expect, test } from "bun:test";
import { setAccessNotice, takeAccessNotice } from "./notice";

test("el aviso entre pantallas de acceso se lee una sola vez", () => {
  expect(takeAccessNotice()).toBeNull();
  setAccessNotice("alreadyVerified");
  expect(takeAccessNotice()).toBe("alreadyVerified");
  expect(takeAccessNotice()).toBeNull();
});
