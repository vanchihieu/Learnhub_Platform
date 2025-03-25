"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CourseEnrollButtonProps {
  courseId: string;
  price: number;
  isPurchased: boolean;
  firstChapterId?: string;
}

export const CourseEnrollButton = ({
  courseId,
  price,
  isPurchased,
  firstChapterId,
}: CourseEnrollButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      // Nếu đã mua, chuyển đến chương đầu tiên
      if (isPurchased && firstChapterId) {
        return router.push(`/courses/${courseId}/chapters/${firstChapterId}`);
      }

      // Nếu chưa mua, tạo checkout session với Stripe
      if (price === 0) {
        // Nếu khóa học miễn phí, đăng ký trực tiếp
        await axios.post(`/api/courses/${courseId}/checkout`, {
          price,
        });

        toast.success("Đăng ký thành công!");
        return router.refresh();
      }

      // Khóa học có phí, chuyển đến trang thanh toán
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.href = response.data.url;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="w-full md:text-lg"
      variant={isPurchased ? "outline" : "default"}
    >
      {isPurchased
        ? "Tiếp tục học"
        : price === 0
        ? "Đăng ký miễn phí"
        : "Mua khóa học"}
    </Button>
  );
};
