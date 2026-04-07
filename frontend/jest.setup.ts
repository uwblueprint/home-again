import '@testing-library/jest-dom';

import { randomUUID } from "crypto";

global.crypto = {
  ...global.crypto,
  randomUUID: randomUUID,
} as Crypto;