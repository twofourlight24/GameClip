import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { basename, extname, join } from "node:path";
import { promisify } from "node:util";

const port = Number(process.env.UPLOAD_PORT || 4000);
const uploadDir = join(process.cwd(), "uploads");
const avatarDir = join(uploadDir, "avatars");
const metadataPath = join(uploadDir, "videos.json");
const usersPath = join(uploadDir, "users.json");
const sessionsPath = join(uploadDir, "sessions.json");
const sessionCookieName = "gameclip_session";
const sessionMaxAgeSeconds = 7 * 24 * 60 * 60;
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 250 * 1024 * 1024);
const allowedExtensions = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);
const allowedAvatarExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const mimeByExtension = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".m4v", "video/x-m4v"],
  [".avi", "video/x-msvideo"],
  [".mkv", "video/x-matroska"],
]);
const avatarMimeByExtension = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);
const runFile = promisify(execFile);

await mkdir(uploadDir, { recursive: true });
await mkdir(avatarDir, { recursive: true });

createServer(async (request, response) => {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, uploadDir });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/videos") {
      sendJson(response, 200, await publicVideos(request));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/signup") {
      const user = await saveSignup(request);
      sendJson(response, 201, toPublicUser(user, request));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/login") {
      const user = await loginUser(await readJsonRequest(request));
      await createSession(user.id, response);
      sendJson(response, 200, toPublicUser(user, request));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
      await logoutUser(request, response);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/me") {
      const user = await requireSessionUser(request);
      sendJson(response, 200, toPublicUser(user, request));
      return;
    }

    if (request.method === "PATCH" && url.pathname === "/api/me") {
      const user = await updateCurrentUser(request);
      sendJson(response, 200, toPublicUser(user, request));
      return;
    }

    if (request.method === "DELETE" && url.pathname === "/api/me") {
      await deleteCurrentUser(request, response);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/videos") {
      const video = await saveVideoUpload(request);
      sendJson(response, 201, await publicVideo(video, request));
      return;
    }

    const videoId = url.pathname.match(/^\/api\/videos\/([^/]+)$/)?.[1];

    if (request.method === "DELETE" && videoId) {
      await deleteVideo(videoId, await readJsonRequest(request), request);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "PATCH" && videoId) {
      const video = await updateVideo(videoId, await readJsonRequest(request), request);
      sendJson(response, 200, await publicVideo(video, request));
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/uploads/")) {
      await streamUploadedVideo(url.pathname, request, response);
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/avatars/")) {
      await streamAvatar(url.pathname, response);
      return;
    }

    sendJson(response, 404, { message: "Not found." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(response, statusCode, {
      message: statusCode === 500 ? "Request failed." : error.message,
    });

    if (statusCode === 500) {
      console.error(error);
    }
  }
}).listen(port, () => {
  console.log(`Local upload API listening on http://localhost:${port}`);
});

async function saveVideoUpload(request) {
  const contentType = request.headers["content-type"] || "";
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.slice(1).find(Boolean);

  if (!contentType.startsWith("multipart/form-data") || !boundary) {
    throw httpError(415, "Use multipart/form-data with a video field.");
  }

  const parts = parseMultipartBody(await readBody(request), boundary);
  const file = parts.files.video;
  const sessionUser = await readOptionalSessionUser(request);

  if (!file) {
    throw httpError(400, "The video file field is required.");
  }

  const extension = extname(file.filename).toLowerCase();
  const isVideoMime = file.contentType.startsWith("video/");

  if (!isVideoMime || !allowedExtensions.has(extension)) {
    throw httpError(415, "Upload a video file such as mp4, webm, mov, m4v, avi, or mkv.");
  }

  const id = randomUUID();
  const storedName = `${id}${extension}`;
  await writeFile(join(uploadDir, storedName), file.data);
  const isAnonymous = booleanField(parts.fields.isAnonymous);
  const ownerUserId = sessionUser && !isAnonymous ? sessionUser.id : null;
  const uploader = sessionUser && !isAnonymous
    ? sessionUser.nickname
    : textField(parts.fields.uploader, "");

  const video = {
    id,
    title: textField(parts.fields.title, file.filename),
    gameName: textField(parts.fields.gameName, ""),
    gameTag: textField(parts.fields.gameTag, ""),
    uploader: isAnonymous ? "" : uploader,
    isAnonymous,
    anonymousUploader: isAnonymous ? uploader : "",
    ownerUserId,
    passwordHash: ownerUserId ? null : passwordField(parts.fields.password),
    originalName: file.filename,
    contentType: file.contentType,
    size: file.data.length,
    videoPath: `/uploads/${storedName}`,
    createdAt: new Date().toISOString(),
  };

  const videos = await readVideos();
  videos.unshift(video);
  await writeFile(metadataPath, `${JSON.stringify(videos, null, 2)}\n`, "utf8");
  return video;
}

async function saveSignup(request) {
  const contentType = request.headers["content-type"] || "";
  const parts = contentType.startsWith("multipart/form-data")
    ? parseMultipartBody(await readBody(request), readMultipartBoundary(contentType))
    : { fields: await readJsonRequest(request), files: {} };
  const username = validateUsername(parts.fields.username);
  validatePasswordConfirmation(parts.fields.password, parts.fields.passwordConfirm, "Password confirmation does not match.");
  const passwordHash = validateAndHashSignupPassword(parts.fields.password);
  const nickname = validateNickname(parts.fields.nickname);
  const users = await readUsers();

  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    throw httpError(409, "This username is already taken.");
  }

  const id = randomUUID();
  const user = {
    id,
    username,
    nickname,
    avatarPath: null,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.unshift(user);
  await writeUsers(users);
  return user;
}

async function loginUser(payload = {}) {
  const username = validateUsername(payload.username);

  if (typeof payload.password !== "string" || !payload.password) {
    throw httpError(400, "Password is required.");
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.username.toLowerCase() === username.toLowerCase());

  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    throw httpError(401, "Username or password is incorrect.");
  }

  return user;
}

async function logoutUser(request, response) {
  const token = getSessionToken(request);

  if (token) {
    await removeSession(token);
  }

  clearSessionCookie(response);
}

async function updateCurrentUser(request) {
  const currentUser = await requireSessionUser(request);
  const contentType = request.headers["content-type"] || "";
  const payload = contentType.startsWith("multipart/form-data")
    ? parseMultipartBody(await readBody(request), readMultipartBoundary(contentType))
    : { fields: await readJsonRequest(request), files: {} };
  const users = await readUsers();
  const user = users.find((entry) => entry.id === currentUser.id);

  if (!user) {
    throw httpError(401, "Login is required.");
  }

  if (Object.hasOwn(payload.fields, "nickname")) {
    user.nickname = validateNickname(payload.fields.nickname);
  }

  if (payload.files.avatar) {
    const previousAvatarPath = user.avatarPath;
    const nextAvatarPath = await saveAvatarFile(user.id, payload.files.avatar);
    user.avatarPath = nextAvatarPath;

    if (previousAvatarPath !== nextAvatarPath) {
      await deleteAvatarFile(previousAvatarPath);
    }
  }

  const wantsPasswordChange =
    Object.hasOwn(payload.fields, "currentPassword") || Object.hasOwn(payload.fields, "newPassword");

  if (wantsPasswordChange) {
    if (typeof payload.fields.currentPassword !== "string" || !verifyPassword(payload.fields.currentPassword, user.passwordHash)) {
      throw httpError(403, "Current password is incorrect.");
    }

    validatePasswordConfirmation(
      payload.fields.newPassword,
      payload.fields.newPasswordConfirm,
      "New password confirmation does not match.",
    );
    user.passwordHash = validateAndHashSignupPassword(payload.fields.newPassword);
    await removeSessionsForUser(user.id, getSessionToken(request));
  }

  user.updatedAt = new Date().toISOString();
  await writeUsers(users);
  return user;
}

async function deleteCurrentUser(request, response) {
  const user = await requireSessionUser(request);
  const payload = await readJsonRequest(request);

  if (typeof payload.password !== "string" || !verifyPassword(payload.password, user.passwordHash)) {
    throw httpError(403, "Password is incorrect.");
  }

  const users = await readUsers();
  await writeUsers(users.filter((entry) => entry.id !== user.id));
  await deleteAvatarFile(user.avatarPath);
  await removeSessionsForUser(user.id);
  clearSessionCookie(response);
}

async function streamUploadedVideo(pathname, request, response) {
  const fileName = basename(decodeURIComponent(pathname.slice("/uploads/".length)));
  const extension = extname(fileName).toLowerCase();

  if (!fileName || !allowedExtensions.has(extension)) {
    throw httpError(404, "Video not found.");
  }

  const filePath = join(uploadDir, fileName);

  try {
    const fileStat = await stat(filePath);
    const range = readByteRange(request.headers.range, fileStat.size);
    const headers = {
      "Accept-Ranges": "bytes",
      "Content-Length": fileStat.size,
      "Content-Type": mimeByExtension.get(extension) || "application/octet-stream",
    };

    if (range) {
      headers["Content-Length"] = range.end - range.start + 1;
      headers["Content-Range"] = `bytes ${range.start}-${range.end}/${fileStat.size}`;
      response.writeHead(206, headers);
      createReadStream(filePath, range).pipe(response);
      return;
    }

    response.writeHead(200, headers);
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw httpError(404, "Video not found.");
    }

    throw error;
  }
}

async function streamAvatar(pathname, response) {
  const fileName = basename(decodeURIComponent(pathname.slice("/avatars/".length)));
  const extension = extname(fileName).toLowerCase();

  if (!fileName || !allowedAvatarExtensions.has(extension)) {
    throw httpError(404, "Avatar not found.");
  }

  const filePath = join(avatarDir, fileName);

  try {
    const fileStat = await stat(filePath);
    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type": avatarMimeByExtension.get(extension) || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw httpError(404, "Avatar not found.");
    }

    throw error;
  }
}

function readByteRange(header, size) {
  const match = typeof header === "string" && header.match(/^bytes=(\d+)-(\d*)$/);

  if (!match) {
    return null;
  }

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;

  if (!Number.isInteger(start) || !Number.isInteger(requestedEnd) || start >= size || requestedEnd < start) {
    return null;
  }

  return { start, end: Math.min(requestedEnd, size - 1) };
}

async function readVideos() {
  try {
    return JSON.parse(await readFile(metadataPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readUsers() {
  try {
    return JSON.parse(await readFile(usersPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function publicVideos(request) {
  const users = await readUsers();
  const usersById = new Map(users.map((user) => [user.id, user]));
  return (await readVideos()).map((video) => toPublicVideo(video, request, usersById.get(video.ownerUserId)));
}

async function publicVideo(video, request) {
  if (!video.ownerUserId) {
    return toPublicVideo(video, request);
  }

  const users = await readUsers();
  return toPublicVideo(video, request, users.find((user) => user.id === video.ownerUserId));
}

async function writeUsers(users) {
  await writeFile(usersPath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

async function readSessions() {
  try {
    return JSON.parse(await readFile(sessionsPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeSessions(sessions) {
  await writeFile(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

async function deleteVideo(id, payload = {}, request) {
  const videos = await readVideos();
  const video = videos.find((entry) => entry.id === id);

  if (!video) {
    throw httpError(404, "Video not found.");
  }

  await verifyVideoAccess(video, payload.password, request);

  const fileName = basename(video.videoPath || new URL(video.videoUrl).pathname);
  await unlink(join(uploadDir, fileName)).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });

  await writeFile(
    metadataPath,
    `${JSON.stringify(videos.filter((entry) => entry.id !== id), null, 2)}\n`,
    "utf8",
  );
}

async function updateVideo(id, payload = {}, request) {
  const videos = await readVideos();
  const video = videos.find((entry) => entry.id === id);

  if (!video) {
    throw httpError(404, "Video not found.");
  }

  await verifyVideoAccess(video, payload.password, request);

  const editableFields = ["title", "uploader", "gameName", "gameTag"];

  for (const field of editableFields) {
    if (Object.hasOwn(payload, field)) {
      video[field] = editableTextField(payload[field], field === "title" ? video.originalName : "");
    }
  }

  video.updatedAt = new Date().toISOString();
  await writeFile(metadataPath, `${JSON.stringify(videos, null, 2)}\n`, "utf8");
  return video;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;

    request.on("data", (chunk) => {
      bytes += chunk.length;

      if (bytes > maxUploadBytes) {
        reject(httpError(413, `Video must be ${Math.floor(maxUploadBytes / 1024 / 1024)} MB or smaller.`));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function readJsonRequest(request) {
  const contentLength = Number(request.headers["content-length"] || 0);

  if (!contentLength) {
    return {};
  }

  const contentType = request.headers["content-type"] || "";

  if (!contentType.startsWith("application/json")) {
    throw httpError(415, "Use application/json for this request.");
  }

  const text = (await readBody(request)).toString("utf8").trim();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw httpError(400, "Request body must be valid JSON.");
  }
}

function parseMultipartBody(body, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");
  const fields = {};
  const files = {};
  let partStart = body.indexOf(delimiter);

  while (partStart !== -1) {
    partStart += delimiter.length;

    if (body.subarray(partStart, partStart + 2).equals(Buffer.from("--"))) {
      break;
    }

    if (body.subarray(partStart, partStart + 2).equals(Buffer.from("\r\n"))) {
      partStart += 2;
    }

    const nextBoundary = body.indexOf(delimiter, partStart);

    if (nextBoundary === -1) {
      break;
    }

    const rawPart = body.subarray(partStart, nextBoundary - 2);
    const headerEnd = rawPart.indexOf(headerSeparator);

    if (headerEnd === -1) {
      partStart = nextBoundary;
      continue;
    }

    const headers = rawPart.subarray(0, headerEnd).toString("utf8");
    const data = rawPart.subarray(headerEnd + headerSeparator.length);
    const disposition = headers.match(/content-disposition:[^\r\n]+/i)?.[0] || "";
    const fieldName = disposition.match(/name="([^"]+)"/i)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/i)?.[1];

    if (fieldName && filename) {
      files[fieldName] = {
        filename: basename(filename),
        contentType: headers.match(/content-type:\s*([^\r\n]+)/i)?.[1] || "application/octet-stream",
        data,
      };
    } else if (fieldName) {
      fields[fieldName] = data.toString("utf8");
    }

    partStart = nextBoundary;
  }

  return { fields, files };
}

function readMultipartBoundary(contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.slice(1).find(Boolean);

  if (!boundary) {
    throw httpError(415, "Use multipart/form-data with a boundary.");
  }

  return boundary;
}

function textField(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function booleanField(value) {
  return value === "true" || value === "1" || value === "on";
}

function validateUsername(value) {
  const username = textField(value, "");

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    throw httpError(400, "Username must be 3-30 characters using letters, numbers, underscores, or hyphens.");
  }

  return username;
}

function validateAndHashSignupPassword(value) {
  if (typeof value !== "string" || value.length < 6 || value.length > 128) {
    throw httpError(400, "Password must be 6-128 characters.");
  }

  return hashPassword(value);
}

function validatePasswordConfirmation(password, passwordConfirm, message) {
  if (password !== passwordConfirm) {
    throw httpError(400, message);
  }
}

function validateNickname(value) {
  const nickname = textField(value, "");

  if (!nickname || nickname.length > 30) {
    throw httpError(400, "Nickname must be 1-30 characters.");
  }

  return nickname;
}

async function saveAvatarFile(userId, file) {
  if (!file || !file.data.length) {
    return null;
  }

  const extension = extname(file.filename).toLowerCase();

  if (!file.contentType.startsWith("image/") || !allowedAvatarExtensions.has(extension)) {
    throw httpError(415, "Profile photo must be png, jpg, jpeg, or webp.");
  }

  if (file.data.length > 2 * 1024 * 1024) {
    throw httpError(413, "Profile photo must be 2 MB or smaller.");
  }

  const tempName = `${userId}.source${extension}`;
  const storedName = `${userId}.png`;
  const tempPath = join(avatarDir, tempName);
  const outputPath = join(avatarDir, storedName);
  await writeFile(tempPath, file.data);

  try {
    await cropAvatarToPng(tempPath, outputPath);
  } catch {
    throw httpError(415, "Profile photo could not be cropped. Upload a valid png, jpg, jpeg, or webp image.");
  } finally {
    await unlink(tempPath).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }

  return `/avatars/${storedName}`;
}

async function deleteAvatarFile(avatarPath) {
  if (!avatarPath) {
    return;
  }

  const fileName = basename(avatarPath);
  await unlink(join(avatarDir, fileName)).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
}

async function cropAvatarToPng(inputPath, outputPath) {
  const args = [
    inputPath,
    "-auto-orient",
    "-resize",
    "64x64^",
    "-gravity",
    "center",
    "-extent",
    "64x64",
    outputPath,
  ];

  try {
    await runFile("magick", args);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await runFile("convert", args);
  }
}

function editableTextField(value, fallback) {
  if (typeof value !== "string") {
    throw httpError(400, "Editable fields must be text.");
  }

  const text = value.trim();

  if (text.length > 120) {
    throw httpError(400, "Editable fields must be 120 characters or fewer.");
  }

  return text || fallback;
}

function passwordField(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return hashPassword(value);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64");
  const iterations = 310000;
  const keyLength = 32;
  const digest = "sha256";
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("base64");
  return `pbkdf2:${digest}:${iterations}:${salt}:${hash}`;
}

function verifyVideoPassword(video, password) {
  if (!video.passwordHash) {
    return;
  }

  if (typeof password !== "string" || !password) {
    throw httpError(401, "Password is required for this video.");
  }

  if (!verifyPassword(password, video.passwordHash)) {
    throw httpError(403, "Password is incorrect.");
  }
}

async function verifyVideoAccess(video, password, request) {
  if (video.ownerUserId) {
    const user = await requireSessionUser(request);

    if (user.id !== video.ownerUserId) {
      throw httpError(403, "Only the uploader can change this video.");
    }

    return;
  }

  verifyVideoPassword(video, password);
}

function verifyPassword(password, storedValue) {
  const [scheme, digest, iterationsText, salt, expectedHash] = String(storedValue).split(":");
  const iterations = Number(iterationsText);

  if (scheme !== "pbkdf2" || !digest || !Number.isInteger(iterations) || !salt || !expectedHash) {
    throw httpError(500, "Stored password format is invalid.");
  }

  const expected = Buffer.from(expectedHash, "base64");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, digest);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function createSession(userId, response) {
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const sessions = await readSessions();
  const session = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + sessionMaxAgeSeconds * 1000).toISOString(),
  };

  sessions.push(session);
  await writeSessions(removeExpiredSessions(sessions));
  setSessionCookie(response, token);
  return session;
}

async function requireSessionUser(request) {
  const token = getSessionToken(request);

  if (!token) {
    throw httpError(401, "Login is required.");
  }

  const sessions = await readSessions();
  const activeSessions = removeExpiredSessions(sessions);

  if (activeSessions.length !== sessions.length) {
    await writeSessions(activeSessions);
  }

  const session = activeSessions.find((entry) => entry.token === token);

  if (!session) {
    throw httpError(401, "Login is required.");
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.id === session.userId);

  if (!user) {
    await removeSession(token);
    throw httpError(401, "Login is required.");
  }

  return user;
}

async function readOptionalSessionUser(request) {
  try {
    return await requireSessionUser(request);
  } catch (error) {
    if (error.statusCode === 401) {
      return null;
    }

    throw error;
  }
}

async function removeSession(token) {
  const sessions = await readSessions();
  await writeSessions(sessions.filter((entry) => entry.token !== token));
}

async function removeSessionsForUser(userId, exceptToken = null) {
  const sessions = await readSessions();
  await writeSessions(sessions.filter((entry) => entry.userId !== userId || entry.token === exceptToken));
}

function removeExpiredSessions(sessions) {
  const now = Date.now();
  return sessions.filter((entry) => new Date(entry.expiresAt).getTime() > now);
}

function getSessionToken(request) {
  return parseCookies(request.headers.cookie || "")[sessionCookieName] || "";
}

function parseCookies(header) {
  return String(header)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf("=");

      if (separator === -1) {
        return cookies;
      }

      cookies[part.slice(0, separator)] = decodeURIComponent(part.slice(separator + 1));
      return cookies;
    }, {});
}

function setSessionCookie(response, token) {
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${sessionMaxAgeSeconds}; SameSite=Lax`,
  );
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", `${sessionCookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function toPublicVideo(video, request, owner = null) {
  const videoPath = video.videoPath || new URL(video.videoUrl).pathname;
  const { passwordHash, ...publicVideo } = video;
  const uploader = video.isAnonymous ? video.anonymousUploader || "익명" : publicVideo.uploader;
  const ownerAvatarUrl = owner ? getPublicAvatarUrl(owner, request) : null;

  return {
    ...publicVideo,
    uploader,
    owner: owner && !video.isAnonymous ? toPublicUser(owner, request) : null,
    avatarUrl: video.isAnonymous ? null : ownerAvatarUrl,
    hasPassword: Boolean(passwordHash),
    videoPath,
    videoUrl: `${getPublicOrigin(request)}${videoPath}`,
  };
}

function toPublicUser(user, request) {
  const { passwordHash, ...publicUser } = user;
  const avatarUrl = getPublicAvatarUrl(user, request);

  return {
    ...publicUser,
    avatarUrl,
    usesDefaultAvatar: !avatarUrl,
  };
}

function getPublicAvatarUrl(user, request) {
  if (!user?.avatarPath) {
    return null;
  }

  const version = encodeURIComponent(user.updatedAt || user.createdAt || "");
  const cacheKey = version ? `?v=${version}` : "";
  return `${getPublicOrigin(request)}${user.avatarPath}${cacheKey}`;
}

function getPublicOrigin(request) {
  const host = request.headers.host || `localhost:${port}`;
  const forwardedProtocol = request.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProtocol === "string" ? forwardedProtocol.split(",")[0].trim() : "http";
  return `${protocol}://${host}`;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  response.setHeader("Access-Control-Allow-Origin", typeof origin === "string" ? origin : "*");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
