import { auth } from "@clerk/nextjs";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { CourseProgress } from "@/components/course-progress";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h2 className="font-semibold">{course.title}</h2>
        {progressCount > 0 && (
          <div className="mt-6">
            <CourseProgress variant="success" value={progressCount} size="sm" />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => {
          const isCompleted = !!chapter.userProgress?.[0]?.isCompleted;

          return (
            <a
              key={chapter.id}
              href={`/courses/${course.id}/chapters/${chapter.id}`}
              className={`
                flex items-center gap-x-2 text-sm font-medium
                transition-all hover:bg-slate-100 
                pl-6 pr-4 py-4 border-b text-slate-600
                ${
                  isCompleted
                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-x-2 py-1">
                <div
                  className={`
                  flex items-center justify-center
                  rounded-full w-5 h-5
                  ${
                    isCompleted
                      ? "text-white bg-emerald-700"
                      : "text-slate-700 border border-slate-300 bg-white"
                  }
                `}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs">{chapter.position}</span>
                  )}
                </div>
                <span className="text-sm truncate">{chapter.title}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
