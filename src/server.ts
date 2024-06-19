import express from "express";
import { createClient } from "graphql-ws";
import { WebSocket } from "ws";

const app = express();
const port = 3000;
const apiPort = 8000;
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJ1c2luZXNzQHVuZ2xvLmNvbSIsImlkIjoiOGI0NDU0ZTMtYTM1OS00YTRmLTkyN2UtMWI1YzUzOWRlNWRhIiwiaWF0IjoxNzE4NzY4NDM0LCJleHAiOjE3MTg3NzIwMzR9.bGvEZeL_Z0kv69GX4Fj3fQEyoH2-HQ84MRGuOuLyeLE";

const wsClient = createClient({
  url: `ws://localhost:${apiPort}/graphql`,
  webSocketImpl: WebSocket,
  connectionParams: {
    Authorization: `Bearer ${token}`,
  },
});

app.get("/connect", async (req, res) => {
  try {
    wsClient.on("connected", () => {
      console.log("Connected to GraphQL server");
      res.send("Connected to GraphQL server");
    });

    wsClient.on("error", (error) => {
      console.error("Connection error:", error);
      res.status(500).send("Connection error");
    });

    wsClient.subscribe(
      {
        query: `
          subscription {
            userStatusChanged
          }
        `,
      },
      {
        next: (data) => console.log("Received data:", data),
        error: (error) => console.error("Subscription error:", error),
        complete: () => console.log("Subscription complete"),
      }
    );
  } catch (error) {
    console.error("Failed to connect:", error);
    res.status(500).send("Failed to connect");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
