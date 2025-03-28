import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });

    const { list } = await req.json();

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });

    if (!ownCourse) return new NextResponse("Unauthorized.", { status: 401 });

    // eslint-disable-next-line prefer-const
    for (let item of list) {
      await db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return new NextResponse("Success.", { status: 200 });
  } catch (error: unknown) {
    console.log("[REORDER]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}
