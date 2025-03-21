import type { Category, Course } from "@prisma/client";

import { db } from "@/lib/db";

import { getProgress } from "./get-progress";

// Định nghĩa kiểu dữ liệu mở rộng từ Course, bao gồm thêm các dữ liệu liên quan:
// - category: Danh mục liên quan (hoặc null nếu không có)
// - chapters: Mảng chứa ID của các chương đã xuất bản
// - progress: Phần trăm tiến độ của người dùng trong khóa học (hoặc null nếu chưa bắt đầu)
type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

// Định nghĩa tham số cho hàm getCourses
// - userId: Bắt buộc để kiểm tra giao dịch mua và tính toán tiến độ
// - title: Bộ lọc tùy chọn để tìm kiếm khóa học theo tiêu đề
// - categoryId: Bộ lọc tùy chọn để hiển thị khóa học từ một danh mục cụ thể
type GetCoursesProps = {
  userId: string;
  title?: string;
  categoryId?: string;
};

// Hàm chính để lấy các khóa học đã xuất bản với bộ lọc và thông tin tiến độ của người dùng
export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCoursesProps): Promise<CourseWithProgressWithCategory[]> => {
  try {
    // Truy vấn cơ sở dữ liệu để lấy các khóa học phù hợp với tiêu chí lọc
    const courses = await db.course.findMany({
      where: {
        isPublished: true, // Chỉ trả về các khóa học đã xuất bản
        title: {
          contains: title, // Lọc theo tiêu đề nếu được cung cấp
        },
        categoryId, // Lọc theo danh mục nếu được cung cấp
      },
      include: {
        category: true, // Bao gồm dữ liệu danh mục liên quan
        chapters: {
          where: {
            isPublished: true, // Chỉ bao gồm các chương đã xuất bản
          },
          select: {
            id: true, // Chỉ cần ID của chương
          },
        },
        purchases: {
          where: {
            userId, // Chỉ bao gồm các giao dịch mua được thực hiện bởi người dùng này
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Hiển thị khóa học mới nhất trước
      },
    });

    // Chuyển đổi mảng khóa học để bao gồm thông tin tiến độ
    const coursesWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          // Nếu người dùng chưa mua khóa học này, trả về khóa học với tiến độ là null
          if (course.purchases.length === 0)
            return {
              ...course,
              progress: null,
            };

          // Tính toán phần trăm tiến độ của người dùng cho khóa học này
          const progressPercentage = await getProgress(userId, course.id);

          // Trả về khóa học với thông tin tiến độ
          return {
            ...course,
            progress: progressPercentage,
          };
        })
      );

    return coursesWithProgress;
  } catch (error: unknown) {
    // Ghi log lỗi và trả về mảng rỗng làm giá trị dự phòng
    console.log("[GET_COURSES]: ", error);
    return [];
  }
};