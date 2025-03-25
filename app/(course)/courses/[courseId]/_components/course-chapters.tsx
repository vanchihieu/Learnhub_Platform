import { CheckCircle, Lock, PlayCircle } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CourseChaptersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chapters: any[];
  isPurchased: boolean;
  courseId: string;
}

export const CourseChapters = ({
  chapters,
  isPurchased,
  courseId,
}: CourseChaptersProps) => {
  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        // Kiểm tra xem chương có miễn phí không hoặc người dùng đã mua khóa học
        const isLocked = !chapter.isFree && !isPurchased;

        // Kiểm tra tiến độ của chương
        const isCompleted = !!chapter.userProgress?.[0]?.isCompleted;

        return (
          <div key={chapter.id} className="border p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                {isCompleted ? (
                  <CheckCircle className="text-emerald-600 h-5 w-5" />
                ) : isLocked ? (
                  <Lock className="text-slate-500 h-5 w-5" />
                ) : (
                  <PlayCircle className="text-slate-500 h-5 w-5" />
                )}
                <h3 className="font-medium text-lg">{chapter.title}</h3>
              </div>
              {isLocked ? (
                <Button variant="ghost" size="sm" disabled>
                  Khóa
                </Button>
              ) : (
                <Link href={`/courses/${courseId}/chapters/${chapter.id}`}>
                  <Button size="sm">
                    {isCompleted ? "Xem lại" : "Học ngay"}
                  </Button>
                </Link>
              )}
            </div>
            {chapter.description && (
              <p className="text-sm text-slate-500 mt-2">
                {chapter.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
