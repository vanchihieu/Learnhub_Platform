import type { Course, Purchase } from "@prisma/client";

import { db } from "@/lib/db";

type PurchaseWithCourse = Purchase & {
  course: Course;
};
 
// nhóm doanh thu theo khóa học 
const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {}; // lưu tổng doanh thu theo khóa học

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;

    // nếu khóa học chưa có trong nhóm thì khởi tạo với giá trị 0
    if (!grouped[courseTitle]) grouped[courseTitle] = 0;

    // nếu khóa học đã có trong nhóm thì cộng dồn doanh thu
    grouped[courseTitle] += purchase.course.price!;
  });
  return grouped;
};

// Lấy thông tin phân tích doanh thu của người dùng
// trả về tổng doanh thu và số lượng bán hàng
export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId,
        },
      },
      include: {
        course: true,
      },
    });

    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({
        name: courseTitle,
        total,
      })
    );

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data, // dữ liệu doanh thu theo từng khóa học
      totalRevenue, // tổng doanh thu
      totalSales, // tổng số giao dịchdịch
    };
  } catch (error: unknown) {
    console.log("[GET_ANALYTICS]: ", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
