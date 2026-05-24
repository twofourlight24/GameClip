import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { basename, extname, join } from "node:path";

const port = Number(process.env.UPLOAD_PORT || 4000);
const uploadDir = join(process.cwd(), "uploads");
const metadataPath = join(uploadDir, "videos.json");
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 250 * 1024 * 1024);
const allowedExtensions = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);
const mimeByExtension = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".m4v", "video/x-m4v"],
  [".avi", "video/x-msvideo"],
  [".mkv", "video/x-matroska"],
]);

await mkdir(uploadDir, { recursive: true });

createServer(async (request, response) => {
  setCorsHeaders(response);

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
      sendJson(response, 200, (await readVideos()).map((video) => toPublicVideo(video, request)));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/videos") {
      const video = await saveVideoUpload(request);
      sendJson(response, 201, toPublicVideo(video, request));
      return;
    }

    const videoId = url.pathname.match(/^\/api\/videos\/([^/]+)$/)?.[1];

    if (request.method === "DELETE" && videoId) {
      await deleteVideo(videoId);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/uploads/")) {
      await streamUploadedVideo(url.pathname, request, response);
      return;
    }

    sendJson(response, 404, { message: "Not found." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(response, statusCode, {
      message: statusCode === 500 ? "Video upload failed." : error.message,
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

  const video = {
    id,
    title: textField(parts.fields.title, file.filename),
    gameName: textField(parts.fields.gameName, ""),
    gameTag: textField(parts.fields.gameTag, ""),
    uploader: textField(parts.fields.uploader, ""),
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

async function deleteVideo(id) {
  const videos = await readVideos();
  const video = videos.find((entry) => entry.id === id);

  if (!video) {
    throw httpError(404, "Video not found.");
  }

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

function textField(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toPublicVideo(video, request) {
  const videoPath = video.videoPath || new URL(video.videoUrl).pathname;
  return {
    ...video,
    videoPath,
    videoUrl: `${getPublicOrigin(request)}${videoPath}`,
  };
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

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
