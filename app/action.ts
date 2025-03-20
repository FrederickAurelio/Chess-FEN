"use server";

export type ResponseFetchType = {
  success: boolean;
  message: string;
  chessboard: {
    fen: string;
  };
};

export async function calculateFen(dataURL: string, origin: string) {
  try {
    const res = await fetch(`${origin}/predict`, {
      method: "POST",
      body: JSON.stringify({ dataURL }),
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = (await res.json()) as ResponseFetchType;
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something Went wrong",
      chessboard: {
        fen: "",
      },
    };
  }
}
