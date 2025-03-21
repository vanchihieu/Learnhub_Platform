import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    // lấy tất cả các chương đã được xuất bản
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    // lấy danh sách id của các chương đã xuất bản
    const publishedChaptersIds = publishedChapters.map((chapter) => chapter.id);

    // lấy số lượng chương đã hoàn thành
    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: publishedChaptersIds,
        },
        isCompleted: true,
      },
    });

    // tính toán phần trăm tiến độ
    const progressPercentage =
      (validCompletedChapters / publishedChaptersIds.length) * 100;

    return progressPercentage;
  } catch (error: unknown) {
    console.log("[GET_PROGRESS]: ", error);
    return 0;
  }
};
