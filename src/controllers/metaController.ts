import { Request, Response } from "express";

export const about = (_req: Request, res: Response): void => {
  res.status(200).json({
    name: "Subhash Rana",
    email: "subhash09468@email.com",
    "my features": {
      "Note Links":
        "Attach related URLs to any note with an optional label. Useful for saving references, sources, or related reading alongside your notes. Only the note owner can add or delete links, but shared users can view them.",
    },
  });
};

export const openapi = (_req: Request, res: Response): void => {
  res.status(200).json({
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description:
        "A multi-user notes service with sharing and link attachment features",
    },
    paths: {
      "/register": {
        post: {
          summary: "Register a new user",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "User registered successfully" },
            "400": { description: "Validation error" },
            "409": { description: "Email already registered" },
          },
        },
      },
      "/login": {
        post: {
          summary: "Login and get JWT token",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Returns JWT access token" },
            "400": { description: "Validation error" },
            "401": { description: "Invalid email or password" },
          },
        },
      },
      "/notes": {
        get: {
          summary: "Get all notes for authenticated user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 10 },
              description: "Notes per page (max 100)",
            },
          ],
          responses: {
            "200": {
              description: "Paginated list of notes",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            title: { type: "string" },
                            content: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 25 },
                          page: { type: "integer", example: 1 },
                          limit: { type: "integer", example: 10 },
                          totalPages: { type: "integer", example: 3 },
                          hasNext: { type: "boolean", example: true },
                          hasPrev: { type: "boolean", example: false },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          summary: "Create a new note",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Note created" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/notes/{id}": {
        get: {
          summary: "Get a specific note by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Note data" },
            "400": { description: "Invalid ID" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note not found" },
          },
        },
        put: {
          summary: "Update a note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Updated note" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note not found" },
          },
        },
        delete: {
          summary: "Delete a note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "204": { description: "Note deleted" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note not found" },
          },
        },
      },
      "/notes/{id}/share": {
        post: {
          summary: "Share a note with another user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["share_with_email"],
                  properties: {
                    share_with_email: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Note shared successfully" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note or user not found" },
          },
        },
      },
      "/notes/{id}/links": {
        post: {
          summary: "Add a link to a note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["url"],
                  properties: {
                    url: { type: "string" },
                    label: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Link added" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note not found" },
          },
        },
        get: {
          summary: "Get all links for a note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "List of links" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note not found" },
          },
        },
      },
      "/notes/{id}/links/{linkId}": {
        delete: {
          summary: "Delete a link from a note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
            {
              name: "linkId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "204": { description: "Link deleted" },
            "401": { description: "Unauthorized" },
            "404": { description: "Note or link not found" },
          },
        },
      },
      "/search": {
        get: {
          summary: "Search notes by keyword",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Keyword to search in note title and content",
            },
          ],
          responses: {
            "200": {
              description: "List of matching notes",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        title: { type: "string", example: "Book Ideas" },
                        content: {
                          type: "string",
                          example: "Read Atomic Habits",
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/about": {
        get: {
          summary: "About the developer",
          responses: {
            "200": {
              description: "Developer info and features",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Subhash Rana",
                      },
                      email: {
                        type: "string",
                        example: "subhash09468@email.com",
                      },
                      "my features": {
                        type: "object",
                        properties: {
                          "Note Links": {
                            type: "string",
                            example:
                              "Attach related URLs to any note with an optional label.",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          summary: "OpenAPI documentation",
          responses: {
            "200": { description: "OpenAPI spec" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  });
};
