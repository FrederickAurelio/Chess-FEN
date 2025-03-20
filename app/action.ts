"use server";

export type ResponseFetchType = {
  success: boolean;
  message: string;
  chessboard: {
    fen: string;
  };
};

export async function calculateFen(dataURL: string) {
  try {
    const res = await fetch("https://chessfen-wlxlhmlrer.cn-hangzhou.fcapp.run/predict", {
      method: "POST",
      body: JSON.stringify({ dataURL }),
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = (await res.json()) as ResponseFetchType;
    console.log(data);
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
