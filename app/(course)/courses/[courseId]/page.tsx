import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CheckCircle, Clock, File } from "lucide-react";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { Banner } from "@/components/banner";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseHeaderImage } from "./_components/course-header-image";
import { CourseChapters } from "./_components/course-chapters";
import { CourseSidebar } from "./_components/course-sidebar";
import { formatPrice } from "@/lib/format";

export default async function CourseIdPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // 1. Lấy thông tin khóa học
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
      },
      category: true,
      purchases: {
        where: {
          userId,
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // 2. Kiểm tra xem khóa học có được xuất bản không
  if (!course.isPublished) {
    return redirect("/");
  }

  // 3. Kiểm tra người dùng đã mua khóa học chưa
  const isPurchased = !!course.purchases.length;

  // 4. Tính toán tiến độ nếu người dùng đã mua
  const progressPercentage = await getProgress(userId, course.id);

  // 5. Tìm chương đầu tiên để chuyển hướng khi nhấn nút "Học ngay"
  const firstChapter = course.chapters[0];

  return (
    <div className="min-h-screen pb-10">
      <div className="hidden md:flex h-full w-80">
      <CourseSidebar 
        course={course} 
        progressCount={progressPercentage} 
      />
    </div>
      {/* Banner hiển thị khi khóa học không được xuất bản */}
      {!course.isPublished && (
        <Banner label="Khóa học này chưa được xuất bản." />
      )}

      <div className="flex flex-col max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="p-6">
            {/* Thông tin khóa học */}
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {course.title}
              </h1>
              {course.category && (
                <div className="flex items-center gap-x-2 text-sm">
                  <div className="py-1 px-2 rounded-full border border-sky-200 bg-sky-100 text-sky-700">
                    {course.category.name}
                  </div>
                </div>
              )}
            </div>

            {/* Thông tin tổng quan */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-x-2 text-slate-700">
                <File size={20} />
                <span>{course.chapters.length} chương</span>
              </div>
              {isPurchased && (
                <div className="flex items-center gap-x-2 text-slate-700">
                  <Clock size={20} />
                  <span>{progressPercentage}% hoàn thành</span>
                </div>
              )}
            </div>

            {/* Mô tả khóa học */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold">Mô tả khóa học</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">
                {course.description || "Không có mô tả cho khóa học này."}
              </p>
            </div>
          </div>

          {/* Sidebar hiển thị thông tin giá và nút đăng ký */}
          <div className="p-6 w-full md:max-w-[400px]">
            <div className="border shadow-sm rounded-lg p-6">
              {/* Hình ảnh khóa học */}
              <CourseHeaderImage
                title={course.title}
                imageUrl={course.imageUrl || "/placeholder.jpg"}
              />

              {/* Hiển thị giá hoặc trạng thái đã mua */}
              <div className="mt-6 text-center">
                {isPurchased ? (
                  <div className="text-center p-2 text-emerald-700 bg-emerald-100 rounded-md mb-4">
                    <div className="flex items-center justify-center gap-x-2">
                      <CheckCircle size={20} />
                      <span>Bạn đã mua khóa học này</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {formatPrice(course.price || 0)}
                  </p>
                )}

                {/* Nút đăng ký hoặc tiếp tục học */}
                <CourseEnrollButton
                  courseId={params.courseId}
                  price={course.price || 0}
                  isPurchased={isPurchased}
                  firstChapterId={firstChapter?.id}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách các chương */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Nội dung khóa học</h2>
          <CourseChapters
            chapters={course.chapters}
            isPurchased={isPurchased}
            courseId={course.id}
          />
        </div>
      </div>
    </div>
  );
}
