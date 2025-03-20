"use server";

export type ResponseFetchType = {
  success: boolean;
  message: "string";
  chessboard: {
    piece_array: [[], [], [], [], [], [], [], []];
    fen: string;
  };
};

export async function calculateFen(dataURL: string) {
  try {
    const res = await fetch("http://localhost:3001/api", {
      method: "POST",
      body: JSON.stringify({ dataURL }),
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = (await res.json()) as ResponseFetchType;
    return data;
  } catch (error) {
    throw new Error(`Something's wrong: ${error}`);
  }
}
